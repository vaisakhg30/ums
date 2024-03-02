const userData = require('../sampleData/data.json');
const writeUsers = require('../sampleData/write.user');
const registrationSchema = require('../schemas/registration.schema');
const updateSchema = require('../schemas/update.schema');

exports.addUser = (req, res) => {
  try {
    const { error } = registrationSchema.validate(req.body);
    if (error) {
      const errorMessage = error.details[0].message.replace(/['"]+/g, '');
      return res.status(400).json({
        status: false,
        message: errorMessage,
      });
    }
    if (req.body.role !== 'agent' && req.body.role !== 'supervisor' && req.body.role !== 'qa' && req.body.role !== 'qc') {
      return res.status(403).json({
        status: 'false',
        message: 'unauthorized role',
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
    const idExist = userData.find((value) => value.id === newUser.id);
    if (idExist) {
      return res.status(409).json({
        status: 'false',
        message: 'id is already exist',
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

exports.updateUser = (req, res) => {
  try {
    const userId = Number(req.params.id);
    const updateUser = req.body;
    const { error } = updateSchema.validate(updateUser);
    if (error) {
      const errorMessage = error.details[0].message.replace(/['"]+/g, '');
      res.status(400).json({
        status: false,
        message: errorMessage,
      });
    }
    const index = userData.findIndex((data) => data.id === userId);
    console.log(index);
    if (index !== -1) {
      userData[index] = { ...userData[index], ...updateUser };
      writeUsers(userData);
      res.status(200).json({
        status: 'true',
        message: 'user update successfully',
      });
    } else {
      res.status(404).json({
        status: 'false',
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

exports.deleteUser = (req, res) => {
  try {
    const userId = Number(req.params.id);
    const userToDelete = userData.find((user) => user.id === userId);
    if (!userToDelete) {
      return res.status(404).json({
        status: false,
        message: 'User not found',
      });
    }
    if (userToDelete.role === 'admin') {
      return res.status(400).json({
        status: false,
        message: 'Cannot delete admin',
      });
    }
    const indexToRemove = userData.indexOf(userToDelete);
    userData.splice(indexToRemove, 1);
    writeUsers(userData);

    return res.status(200).json({
      status: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      message: 'Internal server error',
    });
  }
};

exports.getuser = (req, res) => {
  try {
    res.status(200).json({
      status: true,
      message: 'users data retrieved successfully',
      data: userData,
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({
      status: 'false',
      message: 'token is missing',
    });
  }
};

exports.getOne = (req, res) => {
  try {
    const userId = Number(req.params.id);
    const getOne = userData.find((data) => data.id === userId);
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
    res.status(500).json({
      status: false,
      message: 'internal server error',
    });
  }
};