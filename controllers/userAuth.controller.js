const jwt = require('jsonwebtoken');
const Joi = require('@hapi/joi');
const nodemailer = require('nodemailer');
const otpGenerator = require('otp-generator');
const userData = require('../sampleData/data.json');
const writeUsers = require('../sampleData/write.user');
const registrationSchema = require('../schemas/registration.schema');
const userUpdateSchema = require('../schemas/userupdate.schema');
const updatePassword = require('../schemas/updatePassword.schema');

const { envtoken } = process.env;

let newOtp = null;
exports.addNewUser = (req, res) => {
  try {
    const { error } = registrationSchema.validate(req.body);
    if (error) {
      return res.status(400).send(error.details[0].message);
    }
    const { email, password, role } = req.body;
    if (!email || !password || !role) {
      return res.status(400).json({
        status: 'false',
        message: 'email, password, and role are required',
      });
    }
    if (req.body.role !== 'agent') {
      return res.status(403).json({
        status: 'false',
        message: 'only agent role is available',
      });
    }
    const newUser = { id: new Date().getTime(), ...req.body };
    const emailExist = userData.find((value) => value.email === newUser.email);
    if (emailExist) {
      return res.status(409).json({
        status: 'false',
        message: 'email is already exist',
      });
    }
    userData.push(newUser);
    writeUsers(userData);
    return res.status(201).json({
      status: 'true',
      message: 'registration successful',
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: 'false',
      message: 'token missing or invalid',
    });
  }
};
exports.getone = (req, res) => {
  try {
    const userId = Number(req.params.id);
    const getOne = userData.find((data) => data.id === userId);
    console.log(userData);
    if (getOne) {
      res.status(200).json({
        status: true,
        message: 'user retrieved successfully',
        data: getOne,
      });
    } else {
      res.status(404).json({
        status: false,
        message: 'user not found',
      });
    }
  } catch (error) {
    res.status(400).json({
      status: 'false',
      message: 'internal server error',
    });
  }
};

exports.updateUser = (req, res) => {
  try {
    const userId = Number(req.params.id);
    const updateUser = req.body;
    const { error } = userUpdateSchema.validate(updateUser);
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
    const { err } = updatePassword.validate(password);
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
    newOtp = await otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      specialChars: false,
      alphabets: false,
    });
    const userId = Number(req.params.id);
    const { email } = req.body;
    const userToUpdate = userData.find((user) => user.id === userId);
    if (!userToUpdate) {
      return res.status(400).json({
        status: false,
        message: 'User Not Found',
      });
    }
    const transporter = await nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'vaisakhg30@gmail.com',
        pass: 'oiadmibebbronett',
      },
    });
    const mailOptions = {
      from: 'ums@gmail.com',
      to: email,
      subject: 'OTP to reset password',
      text: newOtp,
    };
    transporter.sendMail(mailOptions, (error) => {
      if (error) {
        res.status(401).send(error);
      } else {
        res.send('otp  sended successfully');
      }
    });
    return res.status(200).json({
      status: true,
      message: 'otp  sended successfully',
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: 'Internal server error',
      error,
    });
  }
};

exports.verifyotp = async (req, res) => {
  try {
    const userId = Number(req.params.id);
    const { otp } = req.body;
    if (otp !== newOtp) {
      return res.status(400).json({
        status: false,
        message: 'invalid otp',
      });
    }
    const result = userData.find((data) => data.id === userId);
    if (result) {
      const token = jwt.sign({ id: result.id, name: result.name, role: result.role }, envtoken, { expiresIn: '15m' });

      return res.status(200).json({
        status: 'true',
        message: 'otp verified',
        access_token: token,
        role: result.role,
      });
    }
    // Clear the OTP
    return res.status(200).send('otp verified');
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

exports.changepassword = (req, res) => {
  try {
    const userId = Number(req.params.id);
    const { password, confirmPassword } = req.body;
    const { error } = Joi.object({
      password: Joi.string().min(8).required(),
      confirmPassword: Joi.string().valid(Joi.ref('password')).required().strict()
        .messages({
          'any.only': 'Passwords do not match',
        }),
    }).validate({ password, confirmPassword });

    if (error) {
      return res.status(400).json({
        status: false,
        message: error.details[0].message,
      });
    }
    const updatepassword = userData.find((data) => data.id === userId);
    if (!updatePassword) {
      return res.status(400).json({
        status: false,
        message: 'User Not Found',
      });
    }
    updatepassword.password = password;
    writeUsers(userData);
    return res.status(200).json({
      status: true,
      message: 'Password Changed',
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      message: 'Internal Server Error',
    });
  }
};