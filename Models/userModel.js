const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const schema =  mongoose.Schema;

const userSchema = new schema({

    firstName:{
        type: String,
        required: true
    },
    lastName:{
        type: String,
        required: true
    },
    email:{
        type: String,
        unique: true,
        required: true
    },
    password:{
        type: String,
        required: true,
        minlength:  [6,'password must be 6 character']
    },
    accounType:{
         type: String,
         default:'seeker'
    },
    profileUrl:{
        type: String,
        default: 'default.jpg'
    },
    contact:{
        type:String,
    },
    cvUrl:{
        type: String
    },
    location:{
        type: String
    },
    jobTitle:{
        type:String
    },
    about:{
        type: String
    },
    active:{
        type: Boolean,
        default:true
    }

}, {timestamps: true})

//compare password
userSchema.methods.isPasswordMatched = async function(enterPassword){
         return await bcrypt.compare(enterPassword, this.password)
}

const users = mongoose.model('Users', userSchema);
module.exports =users;