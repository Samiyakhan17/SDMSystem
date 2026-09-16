const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verifies the JWT on protected routes and attaches req.user
async function protect(req, res, next) {
  try {
    let token;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    if (!token) {
      res.status(401);
      throw new Error('Not authorized, no token provided');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Confirm the user still exists and isn't disabled
    const user = await User.findById(decoded.id).select('-passwordHash');
    if (!user) {
      res.status(401);
      throw new Error('Not authorized, user no longer exists');
    }
    if (user.status === 'disabled') {
      res.status(403);
      throw new Error('This account has been disabled');
    }

    req.user = user; // available in every controller after this middleware
    next();
  } catch (err) {
    res.status(401);
    next(new Error('Not authorized, token invalid or expired'));
  }
}

module.exports = { protect };