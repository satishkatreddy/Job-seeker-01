const express = require('express');
const router  = express.Router();
const {signUp,signIn,logOut, getUsers, userUpdateProfile}= require('../controllers/userController');
const uploads = require('../Middleware/uploadImage');

router.post('/signUp/user', uploads.fields({name:'profileUrl', name:'cvUrl'}), signUp);
router.post('/signIn/user', signIn);
router.get('/logOut', logOut);
router.get('/getUser/:id', getUsers);
router.patch('/userUpdate/:id',uploads.fields({name:'profileUrl', name:'cvUrl'}), userUpdateProfile);



module.exports = router;