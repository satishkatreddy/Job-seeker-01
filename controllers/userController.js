const asyncHandler = require('../utils/asyncHandler');
const appError = require('../utils/appError');
const userModel = require('../Models/userModel');
const bcrypt = require('bcrypt');
const generateToken = require('../utils/generateToken');
const mongoose = require('mongoose');


//register api
const signUp = asyncHandler(async (req, res) => {

    const users = {
        firstName, lastName, email, password, about,
        location, jobTitle, contact
    } = req.body;

    if (!users || !userModel.length === 0) {
        throw new appError('provide valid details', 400)
    }

    const userEmail = await userModel.findOne({ email: email });
    if (userEmail) {
        throw new appError('Email already exists!', 400)
    }
    const salt = bcrypt.genSaltSync(10);
    const hashPassword = bcrypt.hashSync(password, salt);


    const user = await userModel.create({
        firstName: firstName,
        lastName: lastName,
        email: email,
        password: hashPassword,
        about: about,
        location: location,
        jobTitle: jobTitle,
        contact: contact,
        cvUrl: req.file.fileName,
        profileUrl: req.file ? req.file.fileName : 'default.jpg'
    })
    return res.status(201).json({
        message: 'user created successfully', data: user
    },)


})


const signIn = asyncHandler(async (req, res) => {


    const user = {
        email, password
    } = req.body;

    if (!user || !user.length === 0) {
        throw new appError('provide valid input', 400)
    }
    const checkEmail = await userModel.findOne({ email: email, active: true })
    if (!checkEmail) {
        throw new appError('user is not found', 404)
    }
    const isPasswordCorrect = checkEmail.isPasswordMatched(password)
    if (!isPasswordCorrect) {
        throw new appError('provide valid password', 400)
    }
    const token = await generateToken(checkEmail._id);
    return res.status(200).json({
        message: 'login successfully', data: {
            firstName: checkEmail.firstName,
            lastName: checkEmail.lastName,
            email: checkEmail.email,
            password: checkEmail.password,
            location: checkEmail.location,
            about: checkEmail.about,
            contact: checkEmail.contact,
            profileUrl: checkEmail.profileUrl,
            cvUrl: checkEmail.cvUrl,
            jobTitle: checkEmail.jobTitle,
            _id: checkEmail._id,
            token: token
        }
    })
})

//logOut
const logOut = asyncHandler(async (req, res) => {

    const cookie = req.cookie
    if (!cookie) {
        throw new appError('refersh Token is not found!', 400)
    }
    const refreshToken = cookie.refreshToken
    const user = await userModel.findOne({ refreshToken });
    if (!user) {
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: true
        })
        return res.status(204);
    }
    await userModel.findByIdAndUpdate({
        refreshToken: " "
    })
    res.clearCookie('refershToken', {
        httpOnly: true,
        secure: true
    })
    return res.status(204);
})

const userUpdateProfile = asyncHandler(async (req, res) => {

    const users = {
        firstName, lastName, email, password, about, location, contact, profileUrl, cvUrl, jobTitle
    } = req.body;
    if (!users || !users.length === 0) {
        throw new appError('provide valid details', 400)
    }

    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new appError('provide valid id', 400)
    }
    const updateUsers = await userModel.findById({ _id: id, active: true });
    if (!updateUsers) {
        throw new appError('user is not found', 404)
    }
    updateUsers.password = undefined;
    const userDetails = await userModel.findByIdAndUpdate(id, {
        $set: {
            firstName: users.firstName ?? updateUsers.firstName,
            lastName: users.lastName ?? updateUsers.lastName,
            email: users.email ?? updateUsers.email,
            about: users.about ?? updateUsers.about,
            location: users.location ?? updateUsers.location,
            contact: users.contact ?? updateUsers.contact,
            profileUrl: users.profileUrl ?? updateUsers.profileUrl,
            cvUrl: users.cvUrl ?? updateUsers.cvUrl,
            jobTitle: users.jobTitle ?? updateUsers.jobTitle
        }
    }, { new: true })
    return res.status(200).json({ message: 'user details updated succesfully', data: userDetails });
})

const getUsers = asyncHandler(async (req, res) => {

    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new appError('provide valid id', 400)
    }
    const getUser = await userModel.findById({ _id: id, active: true });
    if (!getUser) {
        throw new appError('user is not found!', 404)
    }
    getUser.password = undefined;
    return res.status(200).json({ message: 'fetched user details', data: getUser });
})


module.exports = {
    signIn,
    signUp,
    logOut,
    getUsers,
    userUpdateProfile
}