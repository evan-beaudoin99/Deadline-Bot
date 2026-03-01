const mongoose = require('mongoose');
const env = require('./env');

async function connectDatabase() {
  try {
    await mongoose.connect(env.MONGO_URL);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection failed', error);
    throw error;
  }
}

module.exports = { connectDatabase };
