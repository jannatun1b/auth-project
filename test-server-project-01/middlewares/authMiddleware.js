import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const authMiddleware = async (req, res, next) => {
  try {
    // cookie থেকে token নেওয়া
    const token = req.cookies?.authToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized! Token not found',
      });
    }

    // token verify
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // user find
    const user = await User.findById(decoded._id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized! User not found',
      });
    }

    // req এ user attach
    req.user = user;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized! Invalid token',
    });
  }
};

export default authMiddleware;
