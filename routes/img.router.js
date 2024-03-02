const express = require('express');

const imgController = require('../controllers/img.controller');

const router = express.Router();
const UploadPost = require('../middleware/multer.middleware');

router.post('/import', UploadPost.UploadImage, imgController.saveBlog);
router.get('/export/:filename', imgController.getimage);
module.exports = router;