const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const Joi = require('@hapi/joi');
const adminData = require('../sampleData/data.json');

dotenv.config();

const { envtoken, REFRESH_TOKEN_SECRET } = process.env;
const authSchema = Joi.object({
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().min(8).required(),

});

exports.login = (req, res) => {
  try {
    const { error } = authSchema.validate(req.body);
    if (error) {
      return res.status(400).send(error.details[0].message);
    }
    const { email, password } = req.body;
    const result = adminData.find((data) => data.email === email);
    if (result && result.password === password) {
      const token = jwt.sign({ id: result.id, name: result.name, role: result.role }, envtoken, { expiresIn: '1hr' });
      const refreshToken = jwt.sign({ id: result.id }, REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
      return res.status(200).json({
        status: 'true',
        message: 'login successful',
        access_token: token,
        refresh_token: refreshToken,
        role: result.role,
      });
    }
    return res.status(400).json({
      status: 'false',
      message: 'invalid email or password',
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: 'false',
      message: 'Internal Server Error',
    });
  }
};

exports.refreshtoken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({
        status: false,
        message: 'refresh token is required',
      });
    }
    const decodedToken = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
    const userId = decodedToken.id;
    if (!userId) {
      return res.status(400).json({
        status: false,
        message: 'invalid refresh token',
      });
    }
    const newToken = jwt.sign({ id: userId }, REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
    return res.status(200).json({
      status: true,
      refresh_token: newToken,
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      status: false,
      message: 'error refreshing token',
    });
  }
};