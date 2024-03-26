const mongoose = require('mongoose');

const Dbconnection = async(req,res)=>{
     try{
        const Db = mongoose.connect(process.env.MONGO_URL);
        console.log('Db is connected successfully');
        return Db;
     }
     catch(err){
        console.error(err);
        throw new Error('unable to connection database!!..')
     }
       
}
module.exports =Dbconnection;
