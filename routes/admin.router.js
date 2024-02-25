const express = require('express');
const adminController = require('../controllers/admin.controller');
const adminCanController = require('../controllers/adminAuth.controller');
const { verifyUserRole } = require('../middleware/authguard.middleware');
const { verifyAdmin } = require('../middleware/admin.middleware');

const router = express.Router();
router.post('/login', adminController.login);
router.post('/user', verifyUserRole, verifyAdmin, adminCanController.addUser);
router.get('/users', verifyUserRole, verifyAdmin, adminCanController.getuser);
router.put('/update/:id', verifyUserRole, verifyAdmin, adminCanController.updateUser);
router.delete('/delete/:id', verifyUserRole, verifyAdmin, adminCanController.deleteUser);

// Refresh Token
router.post('/refresh-token', adminController.refreshtoken);
module.exports = router;