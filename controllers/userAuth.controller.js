const Joi = require('@hapi/joi');
const userData = require('../sampleData/user.json');
const writeUsers = require('../sampleData/write.user');
let nodemailer = require('nodemailer');
const otpGenerator = require('otp-generator')
let new_otp = null;
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



exports.sendOtp = async (req, res) => {
  try {
    new_otp = await otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false, alphabets: false });
    const userId = Number(req.params.id);
    const { email } = req.body;
    const userToUpdate = userData.find((user) => user.id === userId);
    if (!userToUpdate) {
      return res.status(400).json({
        status: false,
        message: 'User Not Found',
      });
    }
    let transporter = await nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'vaisakhg30@gmail.com',
        pass: 'oiadmibebbronett'
      }
    });
    let mailOptions = {
      from: 'ums@gmail.com',
      to: email,
      subject: 'OTP to reset password',
      text: new_otp
    };
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        res.status(401).send(error)
      }
      else {
        res.send("otp  sended successfully")

      }
    });




  } catch (error) {
    return res.status(500).json({
      status: false,
      message: 'Internal server error',
      error: error
    });
  }
};



exports.changepassword = async (req, res) => {
  try {
    const userId = Number(req.params.id);
    const { password, otp } = req.body;

    const userToUpdate = userData.find((user) => user.id === userId);
    if (!userToUpdate) {
      return res.status(400).json({
        status: false,
        message: 'User Not Found',
      });
    }
    if (otp !== new_otp) {
      return res.status(400).send("Invalid OTP");
    }
    const { error } = Joi.string().min(8).validate(password);
    if (error) {
      return res.status(400).json({
        status: false,
        message: error.details[0].message,
      });
    }
    userToUpdate.password = password;
    // Clear the OTP
    new_otp = null;
    writeUsers(userData);
    console.log("Password updated successfully");
    return res.status(200).send("Password updated successfully");
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

