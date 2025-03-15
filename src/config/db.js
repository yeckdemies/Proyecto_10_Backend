const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DB_URL);
    console.log('MongoDB connection SUCCESS');
  } catch (error) {
    console.error('MongoDB connection FAIL');
  }
};

module.exports = { connectDB };
