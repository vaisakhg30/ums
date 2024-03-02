const jwt = require('jsonwebtoken');
require('dotenv').config();

exports.verifyUserRole = async (req, res, next) => {
  try {
    const { envtoken } = process.env;
    console.log('Inside middleware');

    // Extract token from headers
    const token = req.headers.authorization;
    console.log('Token:', token);
    const { genericvalue } = req.headers;
    console.log(genericvalue);

    // Decode and parse token
    if (token && genericvalue) {
      const base64String = token.split('.')[1];
      console.log('Decoded Value:', base64String);

      const decodedValue = Buffer.from(base64String, 'base64').toString('ascii');
      console.log('Decoded Value:', decodedValue);

      // Try to parse JSON
      try {
        const decodedId = jwt.verify(token, envtoken);

        if (decodedId.role === genericvalue && genericvalue != null) {
          console.log('decodedId.role:', decodedId.role);
          next();
        } else {
          res.status(401).send('Unauthorised access');
        }
      } catch (jsonParseError) {
        console.error('JSON Parsing Error:', jsonParseError);
        res.status(500).send('Token missing or invalid');
      }
    } else {
      res.status(403).send('choose generic  value');
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(403).send('Token Expires');
  }
};