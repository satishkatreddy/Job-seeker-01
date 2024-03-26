const asyncHandler = require('../utils/asyncHandler');
const appError = require('../utils/appError');
const companyModel = require('../Models/companyModel');
const bcrypt = require('bcrypt');
const { default: mongoose } = require('mongoose');


//create the company Details
const create = asyncHandler(async (req, res) => {
  const company = {
    name, email, password, about, location, contact
  } = req.body;

  if (!company || !company.length === 0) {
    throw new appError('provide valid details', 400)
  }

  const exitstingEmail = await companyModel.findOne({ email: email, active: true })
  if (exitstingEmail) {
    throw new appError('Email already exists', 400)
  }
  const salt = bcrypt.genSalt(10);
  const hashPassword = bcrypt.hashSync(password, salt);

  const createCompany = await companyModel.create({

    name: exitstingEmail.name,
    email: exitstingEmail.email,
    password: hashPassword,
    about: exitstingEmail.about,
    location: exitstingEmail.location,
    contact: exitstingEmail.contact,
    profileUrl: req.file ? req.file.fileName : 'default.jpg'
  })
  return res.status(201).json({ message: "company details created successfully", data: createCompany })

})

//signIn company details
const companySignIn = asyncHandler(async (req, res) => {
  const user = {
    email, password
  } = req.body;

  if (!user || !user.length === 0) {
    throw new appError('provide valid input', 400)
  }
  const checkEmail = await companyModel.findOne({ email: email, active: true })
  if (!checkEmail) {
    throw new appError('company is not found', 404)
  }
  const isPasswordCorrect = checkEmail.isPasswordMatched(password)
  if (!isPasswordCorrect) {
    throw new appError('provide valid password', 400)
  }
  const token = await generateToken(checkEmail._id);
  return res.status(200).json({
    message: 'login successfully', data: {
      name: checkEmail.name,
      email: checkEmail.email,
      password: checkEmail.password,
      about: checkEmail.about,
      location: checkEmail.location,
      contact: checkEmail.contact,
      profileUrl: checkEmail.profileUrl,
      _id: checkEmail._id,
      token: token
    }
  })
})

//update company profile
const updateCompanyProfile = asyncHandler(async (req, res) => {
  const id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new appError('provide valid id', 400)
  }
  const company = await companyModel.findById({ _id: id, active: true })
  if (!company) {
    throw new appError('company is not found', 400)
  }
  const companyDetails = await companyModel.findByIdAndUpdate(id, {

    $set: {
      name: req.body.name ?? company.name,
      contact: req.body.contact ?? company.contact,
      location: req.body.location ?? company.location,
      profileUrl: req.file ? req.file.fileName : company.profileUrl,
      about: req.body.about ?? company.about
    }
  }, { new: true })

  return res.status(200).json({ message: 'update profile successfully....', data: companyDetails })

})

//get company profile
const getCompany = asyncHandler(async (req, res) => {

  const id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new appError('provide valid id', 400)
  }
  const company = await companyModel.findById({ _id: id, active: true })
  if (!company) {
    throw new appError('company is not found!', 404)
  }
  return res.status(200).json({ message: 'fetched company details', data: company })

})


//getAll companies
const getCompanies =  asyncHandler(async (req, res) => {
    const { search, sort, location } = req.query;

    //conditons for searching filters
    const queryObject = {};

    if (search) {
      queryObject.name = { $regex: search, $options: "i" };
    }

    if (location) {
      queryObject.location = { $regex: location, $options: "i" };
    }

    let queryResult = await companyModel.find(queryObject).select("-password");

    // SORTING
    if (sort === "Newest") {
      queryResult = queryResult.sort("-createdAt");
    }
    if (sort === "Oldest") {
      queryResult = queryResult.sort("createdAt");
    }
    if (sort === "A-Z") {
      queryResult = queryResult.sort("name");
    }
    if (sort === "Z-A") {
      queryResult = queryResult.sort("-name");
    }

    // PADINATIONS
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;

    const skip = (page - 1) * limit;

    // records count
    const total = await companyModel.countDocuments(queryResult);
    const numOfPage = Math.ceil(total / limit);
    // move next page
    // queryResult = queryResult.skip(skip).limit(limit);

    // show mopre instead of moving to next page
    queryResult = queryResult.limit(limit * page);

    const companies = await queryResult;

    res.status(200).json({
      success: true,
      total,
      data: companies,
      page,
      numOfPage,
    });
 
});

//get single company  jobs
const getCompanyJobs = asyncHandler(async (req, res) => {
  const id = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new appError('provide valid id', 400)
  }
  const companyJobs = await companyModel.findById({ _id: id, active: true })
    .populate({
      path: 'jobPosts',
      $options: {
        sort: '-_id'
      }
    }).lean();
  if (!companyJobs) {
    throw new appError('company id is not found!', 404)
  }
  companyJobs.password = undefined;

  return res.status(200).json({ message: "fetched  jobs details", data: companyJobs });
})

//get company Jobs
const getCompanyJobListing = asyncHandler(async (req, res) => {

  const {
    search, sort
  } = req.query;

  const id = req.user.userId;

  const queryObject = {};
  if (search) {
    queryObject.location = { $regex: search, $options: 'i' }
  }
  //sorting in companies 
  let sorting;
  if (sort === 'Newest') {
    sorting === '-createdAt'
  }
  if (sort === 'Oldest') {
    sorting === 'CreatedAt'
  }
  if (sort === 'A-Z') {
    sorting === 'name'
  }
  if (sort === 'Z-A') {
    sorting === '-name'
  }

  const compnaiesResult = await companyModel.findById({ _id: id, active: true })
    .populate({
      path: 'jobPosts',
      $options: {
        sort: sorting
      }
    })
  return res.status(200).json({ message: 'fetched companies in jobs', data: compnaiesResult })
})


    
module.exports = {
  create,
  companySignIn,
  updateCompanyProfile,
  getCompany,
  getCompanies,
  getCompanyJobs,
  getCompanyJobListing
}