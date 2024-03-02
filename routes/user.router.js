const express = require('express');
const loginController = require('../controllers/login.controller');
const userAuthController = require('../controllers/userAuth.controller');
const { verifyUserRole } = require('../middleware/authGuard.middleware');
const { verifyUser } = require('../middleware/user.middleware');
const UploadPost = require('../middleware/multer.middleware');

const router = express.Router();
router.post('/login', loginController.login);
router.post('/add', userAuthController.addNewUser);
router.get('/get/:id', verifyUserRole, verifyUser, userAuthController.getone);
router.put('/update-user/:id', verifyUserRole, verifyUser, UploadPost.UploadImage, userAuthController.updateUser);
router.put('/update-password/:id', verifyUserRole, verifyUser, userAuthController.updatePassword);
router.post('/forgotpassword/:id', userAuthController.sendOtp);
router.post('/verifyotp/:id', userAuthController.verifyotp);
router.post('/changepassword/:id', verifyUser, userAuthController.changepassword);
module.exports = router;