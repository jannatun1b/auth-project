import express from 'express';
import {
  changePassword,
  createUser,
  deleteUser,
  forgotPassword,
  getAllUser,
  loginInUser,
  loginUser,
  resendOTP,
  resetPassword,
  singleUser,
  updateUser,
  verifyAndLoginUser,
  verifyResetCode,
} from '../controllers/userControllers.js';

import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();
// http://localhost: 5050/api/v1/user
// public routes
router.post('/login', loginUser);
router.post('/registration', createUser);
router.post('/verify-user', verifyAndLoginUser);
router.post('/reset-otp', resendOTP);

// fotget password
router.post('/forgot-password', forgotPassword);
router.post('/verify-reset-code', verifyResetCode);
router.post('/reset-password', resetPassword);

// protected routes
router.get('/me', authMiddleware, loginInUser);
router.post('/change-password', authMiddleware, changePassword);
router.get('/', authMiddleware, getAllUser);
router.get('/:id', authMiddleware, singleUser);
router.delete('/:id', authMiddleware, deleteUser);
router.put('/:id', authMiddleware, updateUser);
router.patch('/:id', authMiddleware, updateUser);

export default router;
