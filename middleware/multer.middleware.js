const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './images');
  },
  filename: (req, file, cb) => {
    const fileExtension = path.extname(file.originalname);
    const fileName = 'Image';
    const newFileName = `${fileName}-${Date.now()}${fileExtension}`;
    req.body.filename = newFileName;
    cb(null, newFileName);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    cb(null, true);
  },
});

const UploadImage = upload.single('image');

module.exports = {
  UploadImage,
};
