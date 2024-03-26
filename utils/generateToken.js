const jwt = require('jsonwebtoken');


const generateToken =  (id)=>{

    let token;
    token = jwt.sign({id}, process.env.SECRET_KEY, {expiresIn:'1d'})
    return token;

}
module.exports= generateToken;