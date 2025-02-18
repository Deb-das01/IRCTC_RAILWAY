//process.env.API_KEY retrieves the API key stored in environment variables.
const apiKey = process.env.API_KEY;


// Verification on secret key for admin role
// This function is a middleware used in Express.js.
// It will be called before protected routes to verify the API key.
// Exporting the verifyApiKey Middleware
exports.verifyApiKey = (req, res, next) => {
  // Extracting API Key from Request Headers
  const providedApiKey = req.headers['x-api-key'];
  // This checks if the key sent by the client (providedApiKey) matches the one stored in process.env.API_KEY.
  // If they don't match, access is denied.
  if (providedApiKey !== apiKey) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  //If the API key is valid, next() allows the request to proceed to 
  // the next middleware or route handler.
  next();
};
