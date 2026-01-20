import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      dbName: process.env.DB_NAME || 'tests',
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`.bgBlue.white);
  } catch (error) {
    console.log(`Database Error: ${error.message}`.bgRed.white);
    process.exit(1);
  }
};

export default connectDB;
