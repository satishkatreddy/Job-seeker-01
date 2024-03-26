const multer = require('multer');


const multerStorage= multer.diskStorage({

      destination: (req,file, cb)=>{
         return  cb(null, 'uploads/')
      },
      filename: (req, file, cb)=>{
           return cb(null, `${Date.now()}-${file.filename}-${file.originalname}`);        
      },
});

const uploads = multer({
    storage: multerStorage,
    limits:{
        fileSize:1000000 //mb
    }
})


module.exports = uploads;
  