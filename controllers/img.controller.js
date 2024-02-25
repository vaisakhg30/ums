const path = require('path');
const fs = require('fs');

exports.saveBlog = async (req, res) => {
  try {
    res.status(200).send({ status: 'success', message: 'file uploaded successfully', filename: req.body.filename });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal server errorsss');
  }
};

exports.getimage = ((req, res) => {
  const fileName = req.params.filename;
  console.log(fileName);
  const filePath = path.join('images/', fileName);

  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      return res.status(404).send('File not found');
    }
    res.setHeader('Content-disposition', `attachment; filename=${fileName}`);
    res.setHeader('Content-type', 'application/octet-stream');
    const fileStream = fs.createReadStream(filePath);
    return fileStream.pipe(res);
  });
});