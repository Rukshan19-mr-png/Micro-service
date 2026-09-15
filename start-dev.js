const { spawn, execSync } = require('child_process');
const path = require('path');

const SERVICES = [
  { name: 'auth-service', script: 'services/auth-service/index.js', port: 5001, color: '\x1b[34m' },
  { name: 'event-service', script: 'services/event-service/index.js', port: 5002, color: '\x1b[32m' },
  { name: 'booking-service', script: 'services/booking-service/index.js', port: 5003, color: '\x1b[36m' },
  { name: 'payment-service', script: 'services/payment-service/index.js', port: 5004, color: '\x1b[33m' },
  { name: 'notification-service', script: 'services/notification-service/index.js', port: 5005, color: '\x1b[35m' },
  { name: 'analytics-service', script: 'services/analytics-service/index.js', port: 5006, color: '\x1b[94m' },
  { name: 'api-gateway', script: 'api-gateway/index.js', port: 8000, color: '\x1b[96m' },
  {
    name: 'frontend',
    script: 'node_modules/vite/bin/vite.js',
    args: ['--host', '0.0.0.0', '--port', '5173'],
    cwd: path.join(__dirname, 'frontend'),
    port: 5173,
    color: '\x1b[92m'
  }
];

const RESET = '\x1b[0m';
const children = [];

function killProcessTree(pid) {
  try {
    if (process.platform === 'win32') {
      execSync(`taskkill /pid ${pid} /T /F`, { stdio: 'ignore' });
    } else {
      process.kill(-pid, 'SIGKILL');
    }
  } catch (e) {
    // Process might already be stopped
  }
}

function cleanup() {
  console.log('\n\x1b[31m[System] Shutting down all services...\x1b[0m');
  for (const child of children) {
    if (child && child.pid) {
      killProcessTree(child.pid);
    }
  }
  process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('exit', () => {
  for (const child of children) {
    if (child && child.pid) {
      killProcessTree(child.pid);
    }
  }
});

console.log('======================================================');
console.log('🚀 Starting NexusEvent Full Stack Services & Frontend');
console.log('======================================================\n');

SERVICES.forEach(svc => {
  const cwd = svc.cwd || __dirname;
  const svcPath = path.resolve(cwd, svc.script);
  const args = [svcPath, ...(svc.args || [])];

  const child = spawn(process.execPath, args, {
    cwd,
    env: {
      ...process.env,
      PORT: svc.port,
      DB_USER: process.env.DB_USER || 'postgres',
      DB_PASSWORD: process.env.DB_PASSWORD || 'password',
      DB_NAME: process.env.DB_NAME || 'auth_db',
      DB_HOST: process.env.DB_HOST || 'localhost',
      DB_PORT: process.env.DB_PORT || '5432',
      MONGO_URI: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/event_db',
      API_GATEWAY_URL: 'http://localhost:8000'
    },
    stdio: ['ignore', 'pipe', 'pipe']
  });

  child.stdout.on('data', (data) => {
    const lines = data.toString().trim().split('\n');
    lines.forEach(line => {
      if (line.trim()) {
        console.log(`${svc.color}[${svc.name}]${RESET} ${line}`);
      }
    });
  });

  child.stderr.on('data', (data) => {
    const lines = data.toString().trim().split('\n');
    lines.forEach(line => {
      if (line.trim()) {
        console.error(`${svc.color}[${svc.name} ERR]${RESET} ${line}`);
      }
    });
  });

  child.on('error', (err) => {
    console.error(`${svc.color}[${svc.name} CRITICAL]${RESET} Failed to start: ${err.message}`);
  });

  child.on('close', (code) => {
    if (code !== 0 && code !== null) {
      console.warn(`${svc.color}[${svc.name}]${RESET} Process exited with code ${code}`);
    }
  });

  children.push(child);
});
