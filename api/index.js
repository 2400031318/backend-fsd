const dotenv = require('dotenv');
const mongoose = require('mongoose');
const serverless = require('serverless-http');
const app = require('../src/app');

dotenv.config();

let connectionPromise;

async function ensureMongoConnection() {
  if (mongoose.connection.readyState === 1) return;

  if (!connectionPromise) {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not set in environment');
    }

    connectionPromise = mongoose.connect(process.env.MONGODB_URI).catch(err => {
      connectionPromise = undefined;
      throw err;
    });
  }

  await connectionPromise;
}

app.use(async (req, res, next) => {
  try {
    await ensureMongoConnection();
    next();
  } catch (err) {
    console.error('MongoDB connection failed:', err);
    res.status(500).json({ message: 'Database connection failed' });
  }
});

module.exports = serverless(app);
