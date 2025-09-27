const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  gemini: {
    apiKey: process.env.GEMINI_API_KEY,
    model: 'gemini-2.5-flash',
  },
  server: {
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || 'development',
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000,
    max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  },
  cors: {
    origins: process.env.ALLOWED_ORIGINS 
      ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
      : ['http://localhost:3000'],
  },
};