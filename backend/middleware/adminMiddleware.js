/**
 * adminMiddleware.js
 * ─────────────────────────────────────────────────────────────
 * Middleware that protects admin-only routes.
 * Verifies that the logged-in user's email matches the ADMIN_EMAIL from .env.
 * ─────────────────────────────────────────────────────────────
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');

const requireAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Access denied — no token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch the user from the main User collection
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'User not found.' });
    }

    // Check if user email matches ADMIN_EMAIL (from .env)
    const adminEmail = process.env.ADMIN_EMAIL || '';
    if (user.email.toLowerCase() !== adminEmail.toLowerCase()) {
      return res.status(403).json({ message: 'Access denied — admin privileges required.' });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Session expired — please log in again.' });
    }
    return res.status(401).json({ message: 'Access denied — invalid token.' });
  }
};

module.exports = { requireAdmin };
