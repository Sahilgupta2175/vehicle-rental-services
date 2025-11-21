// Vercel serverless function entry point
require('dotenv').config();
const app = require('../app');
const connectDB = require('../config/db');

// Connect to database
if (process.env.MONGO_URI) {
  connectDB(process.env.MONGO_URI);
}

// Initialize Socket.IO for serverless (limited functionality)
// Note: Socket.IO has limitations in serverless environments
if (typeof global.io === 'undefined') {
  global.io = {
    emit: () => {},
    to: () => ({ emit: () => {} })
  };
}

module.exports = app;
