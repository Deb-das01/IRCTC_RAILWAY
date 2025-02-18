
// Library used to create and verify JWTs
const jwt = require('jsonwebtoken');
//Loads environment variables from a .env file into process.env.
const dotenv = require('dotenv');
// Reads the .env file and makes JWT_SECRET available.
dotenv.config();



const authMiddleware = (req, res, next) => {
  //Looks for the Authorization header in the incoming HTTP request.
  const token = req.header('Authorization');
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }
  try {
    //Decodes and verifies the token using the secret key from .env.
    //If valid, it returns the decoded payload
    //Thus the decoded variable contains the user info rather the user object
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    //Stores the decoded user data (from the token) inside req.user.
    // Now, other middlewares and route handlers can access the authenticated user.
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = authMiddleware;
