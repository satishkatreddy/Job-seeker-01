const express = require('express');
const Dbconnection = require('./utils/dataBase');
const {config} = require('dotenv')
const userRouter = require('./routers/user');
const app= express();


config({
    path:'./config.env'
})
Dbconnection();

//middleware
app.use(express.json());
app.use('/api/users', userRouter);
// app.use('/api/jobs', job);
// app.use('/api/company',company);

const PORT = 5500;
app.listen(PORT, (req,res,err)=>{

   if(err){
    console.log(err)
   }
   else{
    console.log(`server is running on!!...${PORT}`)
   }

})

