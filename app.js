const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const adminRouter = require('./routes/admin.router');
const userRouter = require('./routes/user.router');
const imgRouter = require('./routes/img.router');

dotenv.config();
const server = express();
server.use(bodyParser.json());
server.listen(8000, () => {
  console.log('server is running');
});
server.use('/admin', adminRouter);
server.use('/user', userRouter);
server.use('/img', imgRouter);

// set page not found
server.use('*', (req, res) => {
  res.send('Page Not Found ');
});