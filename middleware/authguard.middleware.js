const jwt = require("jsonwebtoken");
require('dotenv').config();
const usersData = require('../sampleData/user.json');

exports.verifyUserRole = async (req, res, next) => {
    try {
        const envtoken =process.env.envtoken;
        console.log("Inside middleware");

        // Extract token from headers
        const token = req?.headers?.authorization;
        console.log("Token:", token);
        const genericvalue = req.headers.genericvalue
        console.log(genericvalue)
         
        // Decode and parse token
        if (token) {
            const base64String = token.split('.')[1];
            console.log("Decoded Value:", base64String);

            const decodedValue = Buffer.from(base64String, 'base64').toString('ascii');
            console.log("Decoded Value:", decodedValue);

            // Try to parse JSON
            try {
      

                const decodedId = jwt.verify(token, envtoken);


                if (decodedId.role==genericvalue) {
                    next();
                } else {
                    res.status(401).send("Unauthorised access");
                }
            } catch (jsonParseError) {
                console.error("JSON Parsing Error:", jsonParseError);
                res.status(500).send("Internal Server Error");
            }
        } else {
            res.status(403).send("Token Expires");
        }

    } catch (error) {
        console.error("Error:", error);
        res.status(403).send("Token Expires");
    }
};
