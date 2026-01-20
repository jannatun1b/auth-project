import colors from 'colors';

import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import express from 'express';
import connectDB from './config/db.js';
import userRoute from './routes/user.js';
import cors from 'cors';
dotenv.config();

const PORT = process.env.PORT || 8080;

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// ✅ CORS setup
app.use(
  cors({
    origin: 'http://localhost:3000', // frontend URL
    credentials: true, // allow cookies if needed
  })
);

// Routes
app.use('/api/v1/user', userRoute);

app.listen(PORT, () => {
  // DB connect
  connectDB();
  console.log(`Server running on port ${PORT}`.bgGreen.black);
});
