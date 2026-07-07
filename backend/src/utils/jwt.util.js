const jwt = require('jsonwebtoken');

/**
 * Generates a JSON Web Token (JWT) for a given user ID.
 * 
 * @param {number} userId - The unique ID of the user from the database
 * @returns {string} The securely signed JWT token
 */
const generateToken = (userId) => {
  // jwt.sign takes three main arguments:
  // 1. Payload: The data we want to encode into the token (here, just the user's ID)
  // 2. Secret Key: Our highly secure government key from the .env file
  // 3. Options: Configurations like when the token should expire
  return jwt.sign(
    { id: userId }, 
    process.env.JWT_SECRET, 
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d' } // Defaults to 1 day if not specified
  );
};

/**
 * Attaches the JWT token to an HTTP-only cookie.
 * This is an advanced security measure that prevents XSS (Cross-Site Scripting)
 * attacks, because JavaScript in the browser cannot read HTTP-only cookies.
 * 
 * @param {object} res - The Express response object
 * @param {string} token - The generated JWT token
 */
const attachTokenToCookie = (res, token) => {
  // Convert '1d' to milliseconds (1 day = 24 hours * 60 mins * 60 secs * 1000 ms)
  const oneDay = 1000 * 60 * 60 * 24;

  res.cookie('token', token, {
    httpOnly: true, // Prevents access from client-side JavaScript (Crucial for security)
    secure: process.env.NODE_ENV === 'production', // Use secure cookies (HTTPS) only in production
    sameSite: 'strict', // Prevents CSRF attacks
    maxAge: oneDay // Cookie will automatically expire after 1 day
  });
};

module.exports = {
  generateToken,
  attachTokenToCookie
};
