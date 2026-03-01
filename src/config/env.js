const path = require('path');

const env = {
  PORT: Number(process.env.PORT || 3000),
  MONGO_URL: process.env.MONGO_URL || 'mongodb://localhost:27017/deadline',
  SESSION_SECRET: process.env.SESSION_SECRET || 'deadlinebot3000',
  VIEWS_PATH: path.join(__dirname, '../../views'),
  CLIENT_PATH: path.join(__dirname, '../../client')
};

module.exports = env;
