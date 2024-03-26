const mongoose = require('mongoose');
const schema =  mongoose.Schema;
require('../Models/jobModel');


const companySchema = new schema({

    name: {
        type: String,
        required: [true, 'company name is required']
    },
    // lastName: {

    //     type: String,
    //     required: true
    // },
    email: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true,
        minlength: [6, 'password must be 6 character']
    },
    contact: {
        type: String,
    },
    location: {
        type: String
    },
    about:{
        type: String
    },
    profileUrl:{
        type:String,
        default:'default.jpg'
    },
    jobPosts:[{
     type: mongoose.Types.ObjectId,
     ref: 'Jobs'
    }],
    active:{
        type: Boolean,
        default: true
        
    }

}, {timestamps: true})

//compare password
companySchema.methods.isPasswordMatched = async function(enterPassword){
    return bcrypt.compare(this.password, enterPassword)
}

const company = mongoose.model('Companies', companySchema);

module.exports = company;