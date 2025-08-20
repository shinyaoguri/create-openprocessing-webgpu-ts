const { spawn } = require('child_process');
const net = require('net');
const path = require('path');

async function findAvailablePort(startPort = 8080, maxAttempts = 100) {
  for (let port = startPort; port < startPort + maxAttempts; port++) {
    const isAvailable = await checkPort(port);
    if (isAvailable) {
      return port;
    }
  }
  throw new Error(`No available ports found between ${startPort} and ${startPort + maxAttempts}`);
}

function checkPort(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    
    server.once('error', () => {
      resolve(false);
    });
    
    server.once('listening', () => {
      server.close();
      resolve(true);
    });
    
    server.listen(port, '127.0.0.1');
  });
}

async function startServer() {
  try {
    const port = await findAvailablePort(8080);
    console.log(`🚀 Starting server on port ${port}`);
    
    // Export the port for other scripts to use
    process.env.DEV_SERVER_PORT = port;
    
    // Start Python HTTP server
    const distPath = path.join(__dirname, '..', 'dist');
    const server = spawn('python3', ['-m', 'http.server', port.toString()], {
      cwd: distPath,
      stdio: 'inherit'
    });
    
    server.on('error', (err) => {
      console.error('Failed to start server:', err);
      process.exit(1);
    });
    
    // Handle termination
    process.on('SIGINT', () => {
      server.kill();
      process.exit(0);
    });
    
    process.on('SIGTERM', () => {
      server.kill();
      process.exit(0);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

startServer();