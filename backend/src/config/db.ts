import mongoose from 'mongoose';

const connectDB = async () => {
  const dbAddress = process.env.DB_ADDRESS || 'mongodb://127.0.0.1:27017/weblarek';

  try {
    await mongoose.connect(dbAddress);
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error);
    throw new Error(`MongoDB connection failed: ${error}`);
  }
};

export default connectDB;
