const { spawn } = require('child_process');
const net = require('net');
const path = require('path');
const fs = require('fs');

async function findAvailablePort(startPort = 8080, maxAttempts = 100) {
  for (let port = startPort; port < startPort + maxAttempts; port++) {
    const isAvailable = await checkPort(port);
    if (isAvailable) {
      console.log(`✅ Port ${port} is available`);
      return port;
    } else {
      console.log(`⚠️  Port ${port} is already in use, trying next...`);
    }
  }
  throw new Error(`No available ports found between ${startPort} and ${startPort + maxAttempts}`);
}

function checkPort(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    
    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve(false);
      } else {
        resolve(false);
      }
    });
    
    server.once('listening', () => {
      server.close(() => {
        resolve(true);
      });
    });
    
    server.listen(port, '0.0.0.0');
  });
}

async function waitForPort(port, maxAttempts = 30) {
  for (let i = 0; i < maxAttempts; i++) {
    const isOpen = await checkPortOpen(port);
    if (isOpen) {
      return true;
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  return false;
}

function checkPortOpen(port) {
  return new Promise((resolve) => {
    const client = new net.Socket();
    
    client.once('connect', () => {
      client.end();
      resolve(true);
    });
    
    client.once('error', () => {
      resolve(false);
    });
    
    client.connect(port, '127.0.0.1');
  });
}

async function startDevServer() {
  try {
    // Find available port
    const port = await findAvailablePort(8080);
    console.log(`🚀 Starting development server on port ${port}`);
    
    // Write port to temp file for other processes
    const portFile = path.join(__dirname, '.dev-port');
    fs.writeFileSync(portFile, port.toString());
    
    // Build first
    console.log('📦 Building project...');
    const build = spawn('npm', ['run', 'build'], {
      stdio: 'inherit',
      shell: true
    });
    
    await new Promise((resolve, reject) => {
      build.on('close', (code) => {
        if (code === 0) resolve();
        else reject(new Error(`Build failed with code ${code}`));
      });
    });
    
    // Start concurrent processes
    const processes = [];
    
    // Start watch process
    const watch = spawn('npm', ['run', 'dev:watch'], {
      stdio: 'inherit',
      shell: true
    });
    processes.push(watch);
    
    // Start Python HTTP server
    const distPath = path.join(__dirname, '..', 'dist');
    const server = spawn('python3', ['-m', 'http.server', port.toString()], {
      cwd: distPath,
      stdio: 'inherit'
    });
    processes.push(server);
    
    // Wait a bit for server to start, then open browser
    setTimeout(async () => {
      const serverReady = await waitForPort(port);
      if (serverReady) {
        const url = `http://localhost:${port}`;
        console.log(`🌐 Opening ${url}`);
        spawn('open', [url], { stdio: 'ignore' });
      }
    }, 2000);
    
    // Handle termination
    const cleanup = () => {
      console.log('\n🛑 Shutting down development server...');
      processes.forEach(proc => proc.kill());
      if (fs.existsSync(portFile)) {
        fs.unlinkSync(portFile);
      }
      process.exit(0);
    };
    
    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);
    
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

startDevServer();