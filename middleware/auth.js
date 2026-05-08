const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
    console.log(`[AUTH] Token received for ${req.originalUrl}`);
  }

  if (!token) {
    console.error(`[AUTH] Failure: No token provided for ${req.originalUrl}`);
    return res.status(401).json({
      success: false,
      message: 'Not authorized — no token provided',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(decoded.id);

    if (!admin) {
      console.error(`[AUTH] Failure: Admin not found for ID ${decoded.id}`);
      return res.status(401).json({
        success: false,
        message: 'Not authorized — admin not found',
      });
    }

    console.log(`[AUTH] Token verified successfully for admin: ${admin.email}`);
    req.admin = admin;
    next();
  } catch (error) {
    console.error(`[AUTH] Failure: Invalid token - ${error.message}`);
    return res.status(401).json({
      success: false,
      message: 'Not authorized — invalid token',
    });
  }
};

module.exports = { protect };
