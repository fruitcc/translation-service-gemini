const app = require('./app');
const config = require('./config');

const PORT = config.server.port;

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Translation Service running on port ${PORT}`);
  console.log(`Environment: ${config.server.env}`);
  
  if (config.server.env === 'production') {
    console.log(`API endpoints available at https://${process.env.RENDER_EXTERNAL_URL || 'your-domain.com'}/api`);
  } else {
    console.log(`API endpoints available at http://localhost:${PORT}/api`);
  }
  
  if (!config.gemini.apiKey) {
    console.warn('WARNING: GEMINI_API_KEY is not set. The service will not work properly.');
  }
});

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});