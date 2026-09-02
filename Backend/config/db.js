
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    console.log('Connecting to MongoDB at:', mongoUri.includes('@') ? mongoUri.split('@')[1] : mongoUri);
    
    const conn = await mongoose.connect(mongoUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error('MongoDB Connection Error:', error.message);
    console.error('Please ensure MongoDB is running locally (mongod) or MONGODB_URI is properly set in .env');
    process.exit(1);
  }
};

module.exports = connectDB;
