import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 50,
    },

    age: {
      type: Number,
      required: true,
      min: 10,
      max: 100,
    },

    skill: {
      type: String,
      required: true,
      // enum: ['JavaScript', 'NodeJS', 'MongoDB', 'React', 'Python', 'Other'],
      default: 'Other',
    },

    email: {
      type: String,
      unique: true,
      lowercase: true,
      required: true,
      trim: true,
    },

    // 🔐 Authentication Fields
    password: {
      type: String,
      minlength: 6,
    },

    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },

    // ✅ Email Verification
    isVerified: {
      type: Boolean,
      default: false,
    },

    verificationCode: {
      type: String,
    },

    verificationCodeExpire: {
      type: Date,
    },

    // 🔁 Password Reset
    resetPasswordToken: {
      type: String,
    },

    resetPasswordExpire: {
      type: Date,
    },

    // 🔑 JWT / Session Token (optional)
    token: {
      type: String,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Model export
export default mongoose.model('User', userSchema);
