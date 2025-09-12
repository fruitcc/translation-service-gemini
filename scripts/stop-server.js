const { exec } = require('child_process');
const config = require('../src/config');

const port = config.server.port;

console.log(`Stopping translation service on port ${port}...`);

// Find process using the port
exec(`lsof -ti :${port}`, (error, stdout, stderr) => {
  if (error) {
    console.log(`No service running on port ${port}`);
    process.exit(0);
  }
  
  const pids = stdout.trim().split('\n').filter(pid => pid);
  
  if (pids.length === 0) {
    console.log(`No service running on port ${port}`);
    process.exit(0);
  }
  
  // Kill the processes
  pids.forEach(pid => {
    exec(`kill -9 ${pid}`, (killError) => {
      if (killError) {
        console.error(`Failed to stop process ${pid}:`, killError.message);
      } else {
        console.log(`Successfully stopped process ${pid}`);
      }
    });
  });
  
  setTimeout(() => {
    console.log(`Translation service on port ${port} has been stopped`);
    process.exit(0);
  }, 1000);
});