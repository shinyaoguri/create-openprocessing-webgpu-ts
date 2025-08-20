const { exec } = require('child_process');
const net = require('net');

async function waitForPort(port, maxAttempts = 30) {
  for (let i = 0; i < maxAttempts; i++) {
    const isOpen = await checkPort(port);
    if (isOpen) {
      return true;
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  return false;
}

function checkPort(port) {
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

async function openBrowser() {
  // Find the port from the serve.js output file
  const port = process.env.DEV_SERVER_PORT || 8080;
  
  console.log(`⏳ Waiting for server on port ${port}...`);
  
  const serverReady = await waitForPort(port);
  
  if (serverReady) {
    const url = `http://localhost:${port}`;
    console.log(`🌐 Opening ${url}`);
    exec(`open ${url}`, (err) => {
      if (err) {
        console.error('Failed to open browser:', err);
      }
      process.exit(0);
    });
  } else {
    console.error('Server did not start in time');
    process.exit(1);
  }
}

openBrowser();