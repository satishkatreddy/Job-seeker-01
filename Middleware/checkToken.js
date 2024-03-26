const jwt = require('jsonwebtoken');
const appError = require('../utils/appError');
const asyncHandler = require('../utils/asyncHandler');
const userModel = require('../Models/userModel');


const checkToken = asyncHandler(async(req,res,next)=>{

    try{

        if(req.headers.authorization && req.headers.authorization.startWith('Beares')){
                let Token = req.headers.authorization.split(' ')[1];
                const decoded = jwt.verify(Token, process.env.SECRET_KEY);
                req.user = await userModel.findById(decoded.id).select('-password');
                next();
        }
    }
    catch{
        throw new appError('Invalid Token', 400)
    }
    if(!Token){
        throw new appError('Token is not found', 404)
    }
})

module.exports = checkToken;