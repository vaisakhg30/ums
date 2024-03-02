const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const cors = require('cors');
const adminRouter = require('./routes/admin.router');
const userRouter = require('./routes/user.router');
const imgRouter = require('./routes/img.router');

dotenv.config();
const server = express();
server.use(bodyParser.json());
server.use(cors());

server.listen(8000, () => {
  console.log('server is running at port number 8000');
});
server.use('/api', adminRouter);
server.use('/api', userRouter);
server.use('/image', imgRouter);

// set page not found
server.use('*', (req, res) => {
  res.status(404).json({
    status: false,
    message: 'page not found',
  });
});