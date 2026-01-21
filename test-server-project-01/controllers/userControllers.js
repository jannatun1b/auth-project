import bcrypt from 'bcryptjs';
import { readFileSync, writeFileSync } from 'fs';
import jwt from 'jsonwebtoken';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../models/User.js';
import { sendEmail } from '../utility/sendEmail.js';
import { generateOTP } from '../utility/generateOTP.js';

// Convert import.meta.url → __dirname (ESM fix)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Get All Users
 * @param {*} req
 * @param {*} res
 * @param {*} name api/v1/user
 */
export const getAllUser = async (req, res) => {
  try {
    const data = await User.find();
    return res.status(201).json({
      data: data,
      message: 'Get All Users',
    });
  } catch (error) {
    console.log(object);
  }
};

/**
 * Create User
 * @param {*} req
 * @param {*} res
 * @param {*} name api/v1/user
 */
export const createUser = async (req, res) => {
  try {
    const { name, skill, age, email, password } = req.body;

    // Validation
    if (!name) return res.status(400).json({ error: 'Name is required' });
    if (!age) return res.status(400).json({ error: 'Age is required' });
    if (!email) return res.status(400).json({ error: 'Email is required' });
    if (!password) return res.status(400).json({ error: 'Password is required' });

    const existUser = await User.findOne({ email });
    if (existUser) {
      return res.status(400).json({
        error: 'User already exists, try another email',
      });
    }

    // Password Hash
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);

    // OTP setup
    const verificationCode = generateOTP();
    const verificationCodeExpire = Date.now() + 3 * 60 * 1000; // ⏱️ 3 minutes

    // Create user
    const user = await User.create({
      name,
      skill,
      age,
      email,
      password: hash,
      verificationCode,
      verificationCodeExpire,
    });

    // Send Email
    await sendEmail({
      to: email,
      subject: 'Verify your account',
      html: `
        <h2>Email Verification</h2>
        <p>Your verification code is:</p>
        <h1>${verificationCode}</h1>
        <p>This code will expire in 3 minutes.</p>
      `,
    });

    return res.status(201).json({
      message: 'User created. Verification code sent to email.',
      userId: user._id,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

/**
 * Login User with Email Verification
 * @param {*} req
 * @param {*} res
 * @returns
 */
export const verifyAndLoginUser = async (req, res) => {
  try {
    const { email, code } = req.body;

    // Step 1: Validate inputs
    if (!email || !code) {
      return res.status(400).json({
        success: false,
        error: 'Email and code are required!',
      });
    }

    // Step 2: Find user by email (better than finding by code directly)
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found with this email!',
      });
    }

    // Step 3: Verify the code
    if (user.verificationCode !== code) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification code!',
      });
    }

    // Step 4: Check if code is expired (optional but recommended)
    if (user.verificationCodeExpire && new Date() > user.verificationCodeExpire) {
      return res.status(400).json({
        success: false,
        message: 'Verification code has expired!',
      });
    }

    // Step 6: Clear verification code after successful verification
    user.verificationCode = undefined;
    user.verificationCodeExpire = undefined;
    user.isVerified = true; // Add this field to your User model
    await user.save();

    // Step 7: Generate JWT token
    const token = jwt.sign(
      {
        _id: user._id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '7d', // Longer expiry for better UX
      }
    );

    // Step 8: Set cookie and send response
    res
      .status(200)
      .cookie('authToken', token, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      })
      .json({
        success: true,
        message: 'Login successful!',
        token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          isVerified: user.isVerified,
        },
      });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};
/**
 * Resend OTP
 * @param {*} req
 * @param {*} res
 * @returns
 */
export const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const verificationCode = generateOTP();
    user.verificationCode = verificationCode;
    user.verificationCodeExpire = Date.now() + 3 * 60 * 1000;
    await user.save();

    await sendEmail({
      to: email,
      subject: 'Resend Verification Code',
      html: `<h1>${verificationCode}</h1>`,
    });

    res.json({ message: 'New verification code sent' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Login User
 * @param {*} req
 * @param {*} res
 * @returns
 */
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // if (!email || !password) {
    //   return res.status(404).json({
    //     message: 'email or password is required!',
    //   });
    // }

    if (!email) {
      return res.status(404).json({
        error: 'Email is required!',
      });
    } else if (!password) {
      return res.status(404).json({
        error: 'Password is required!',
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        message: 'User not found!',
      });
    }

    if (!user.isVerified) {
      return res.status(404).json({
        message: 'login user not verify',
      });
    }

    const loginData = await bcrypt.compare(password, user.password);

    if (!loginData) {
      return res.status(400).json({
        message: 'Password not match, please try again.',
      });
    }
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '5m',
    });

    res
      .status(200)
      .cookie('authToken', token, {
        httpOnly: false, // JS থেকে cookie access করা যাবে না (security)
        secure: false, // HTTPS হলে true (production এ)
        sameSite: 'strict', // CSRF protection
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      })
      .json({
        success: true,
        message: 'User login success',
        token,
      });
  } catch (error) {
    res.status(400).json({
      message: error,
    });
  }
};

/**
 * Logout User
 * @route POST /api/v1/user/logout
 * @access Private
 */
export const logoutUser = async (req, res) => {
  try {
    res
      .clearCookie('authToken', {
        httpOnly: false,
        secure: false, // production এ true
        sameSite: 'strict',
      })
      .status(200)
      .json({
        success: true,
        message: 'User logged out successfully',
      });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Logout failed',
    });
  }
};

/**
 * LoginIn User
 * @param {*} req
 * @param {*} res
 * @returns
 */
export const loginInUser = async (req, res) => {
  return res.status(200).json({
    success: true,
    user: req.user,
    message: 'User authenticated',
  });
};

/**
 * Single User
 * @param {*} req
 * @param {*} res
 * @param {*} name api/v1/user/:id
 */
export const singleUser = (req, res) => {
  const users = JSON.parse(readFileSync(path.join(__dirname, '../db/users.json')));

  const singleData = users.find((data) => data.id == req.params.id);

  if (singleData) {
    res.status(200).json(singleData);
  } else {
    res.status(400).json({
      message: 'Single User not found.',
    });
  }
};

/**
 * Delete User
 * @param {*} req
 * @param {*} res
 * @param {*} name api/v1/user/:id
 */
export const deleteUser = (req, res) => {
  const users = JSON.parse(readFileSync(path.join(__dirname, '../db/users.json')));

  if (users.some((data) => data.id == req.params.id)) {
    const data = users.filter((data) => data.id != req.params.id);

    writeFileSync(path.join(__dirname, '../db/users.json'), JSON.stringify(data));

    res.status(201).json({
      message: 'user deleted successful',
    });
  } else {
    res.status(400).json({
      message: 'Delete User ID not found.',
    });
  }
};
/**
 * Update User
 * @param {*} req
 * @param {*} res
 * @param {*} name PUT/PATCH/v1/user/:id
 */
export const updateUser = (req, res) => {
  const users = JSON.parse(readFileSync(path.join(__dirname, '../db/users.json')));

  if (users.some((data) => data.id == req.params.id)) {
    users[users.findIndex((data) => data.id == req.params.id)] = {
      ...users[users.findIndex((data) => data.id == req.params.id)],
      ...req.body,
    };
    (writeFileSync(path.join(__dirname, '../db/users.json'), JSON.stringify(users)),
      res.status(200).json({
        massage: 'users updated successful',
      }));
  } else {
    res.status(400).json({
      message: 'Delete User ID not found.',
    });
  }
};

//show profile page

// export const profilePage = (req, res) => {
//   res.render('profile');
// };
// controllers/authController.js

/**
 * Request Password Reset
 * @route POST /api/auth/forgot-password
 */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Validate email
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required!',
      });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      // For security, don't reveal that user doesn't exist
      return res.status(200).json({
        success: true,
        message: 'If your email exists, you will receive a reset code.',
      });
    }

    // Generate 6-digit reset code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Set expiry (15 minutes from now)
    const resetCodeExpires = new Date(Date.now() + 15 * 60 * 1000);

    // Save reset code to user
    user.resetPasswordCode = resetCode;
    user.resetPasswordExpires = resetCodeExpires;
    await user.save();

    // Send email with reset code
    const emailSent = await sendPasswordResetEmail(user.email, resetCode);

    if (!emailSent) {
      return res.status(500).json({
        success: false,
        message: 'Failed to send reset email',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Password reset code sent to your email!',
      // In development, you might want to return the code
      ...(process.env.NODE_ENV === 'development' && { resetCode }),
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

/**
 * Verify Reset Code
 * @route POST /api/auth/verify-reset-code
 */
export const verifyResetCode = async (req, res) => {
  try {
    const { email, resetCode } = req.body;

    if (!email || !resetCode) {
      return res.status(400).json({
        success: false,
        message: 'Email and reset code are required!',
      });
    }

    const user = await User.findOne({
      email,
      resetPasswordCode: resetCode,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset code!',
      });
    }

    // Generate temporary token for password reset (valid for 10 minutes)
    const resetToken = jwt.sign(
      {
        _id: user._id,
        purpose: 'password_reset',
      },
      process.env.JWT_SECRET,
      { expiresIn: '10m' }
    );

    res.status(200).json({
      success: true,
      message: 'Reset code verified successfully!',
      resetToken,
    });
  } catch (error) {
    console.error('Verify reset code error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

/**
 * Reset Password
 * @route POST /api/auth/reset-password
 */
export const resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword, confirmPassword } = req.body;

    // Validate inputs
    if (!resetToken || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required!',
      });
    }

    // Check if passwords match
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match!',
      });
    }

    // Validate password strength
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long!',
      });
    }

    // Verify reset token
    let decoded;
    try {
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET);

      // Check if token is for password reset
      if (decoded.purpose !== 'password_reset') {
        throw new Error('Invalid token purpose');
      }
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token!',
      });
    }

    // Find user
    const user = await User.findById(decoded._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found!',
      });
    }

    // Check if old password is same as new (optional)
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message: 'New password cannot be same as old password!',
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password and clear reset fields
    user.password = hashedPassword;
    user.resetPasswordCode = undefined;
    user.resetPasswordExpires = undefined;
    user.lastPasswordChange = new Date();
    await user.save();

    // Optional: Invalidate all existing sessions
    // await Token.deleteMany({ userId: user._id });

    // Send confirmation email
    await sendPasswordChangeConfirmationEmail(user.email);

    res.status(200).json({
      success: true,
      message: 'Password reset successfully! You can now login with your new password.',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

/**
 * Change Password (For logged-in users)
 * @route POST /api/auth/change-password
 */
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const userId = req.user._id; // From auth middleware

    // Validate inputs
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required!',
      });
    }

    // Check if new passwords match
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'New passwords do not match!',
      });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found!',
      });
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect!',
      });
    }

    // Check if new password is same as old
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message: 'New password cannot be same as current password!',
      });
    }

    // Validate password strength
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long!',
      });
    }

    // Hash and save new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.lastPasswordChange = new Date();
    await user.save();

    // Optional: Logout from all devices
    // await Token.deleteMany({ userId: user._id });

    // Send email notification
    await sendPasswordChangeConfirmationEmail(user.email);

    res.status(200).json({
      success: true,
      message: 'Password changed successfully!',
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};
