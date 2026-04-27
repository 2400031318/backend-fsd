const dotenv = require('dotenv');
const mongoose = require('mongoose');
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

module.exports = async (req, res) => {
  try {
    await ensureMongoConnection();
    return app(req, res);
  } catch (err) {
    console.error('Serverless invocation failed:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
