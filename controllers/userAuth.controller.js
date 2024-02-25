const Joi = require('@hapi/joi');
const userData = require('../sampleData/user.json');
const writeUsers = require('../sampleData/write.user');

const authSchema = Joi.object({
  firstname: Joi.string().min(2).pattern(/^[a-zA-Z]+$/).message('First name must contain only alphabetic characters')
    .required(),
  lastname: Joi.string().min(2).pattern(/^[a-zA-Z]+$/).message('Second name must contain only alphabetic characters')
    .required(),
});

exports.getone = (req, res) => {
  try {
    const userId = Number(req.params.id);
    const getOne = userData.find((data) => data.id === userId);
    console.log(userData);
    if (getOne) {
      res.status(200).send(getOne);
    } else {
      res.status(400).send('not found');
    }
  } catch (error) {
    res.status(400).json({
      status: 'false',
      message: 'Internal Server Error',
    });
  }
};

exports.updateUser = (req, res) => {
  try {
    const userId = Number(req.params.id);
    const updateUser = req.body;
    const { error } = authSchema.validate(updateUser);
    if (error) {
      res.status(400).json({
        status: 'false',
        message: error.details[0].message,
      });
    }
    const index = userData.findIndex((data) => data.id === userId);
    console.log(index);
    if (index !== -1) {
      userData[index] = { ...userData[index], ...updateUser };
      writeUsers(userData);
      res.status(200).json({
        status: 'true',
        message: 'Updated',
      });
    } else {
      res.status(404).json({
        status: 'false',
        message: 'User Not Found',
      });
    }
  } catch (error) {
    res.status(400).json({
      status: 'false',
      message: 'Internal Server Error',
    });
  }
};

exports.updatePassword = (req, res) => {
  try {
    const userId = Number(req.params.id);
    const { password } = req.body;
    const { err } = authSchema.validate(password);
    if (err) {
      res.status(400).json({
        status: 'false',
        message: err.details[0].message,
      });
    }
    const userToUpdate = userData.find((user) => user.id === userId);
    if (!userToUpdate) {
      return res.status(400).json({
        status: false,
        message: 'User Not Found',
      });
    }
    const { error } = Joi.string().min(8).validate(password);
    if (error) {
      return res.status(400).json({
        status: false,
        send: error.details[0].message,
      });
    }
    userToUpdate.password = password;
    writeUsers(userData);
    return res.status(200).json({
      status: true,
      message: 'Password updated',
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: 'Internal server error',
    });
  }
};