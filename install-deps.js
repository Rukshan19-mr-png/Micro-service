const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const dirs = [
  'api-gateway',
  'services/auth-service',
  'services/event-service',
  'services/booking-service',
  'services/payment-service',
  'services/notification-service'
];

const allDeps = new Set();
dirs.forEach(dir => {
  const filePath = path.join(__dirname, dir, 'index.js');
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const regex = /require\(['"]([^'"]+)['"]\)/g;
    let match;
    while ((match = regex.exec(content)) !== null) {
      if (!match[1].startsWith('.')) {
        allDeps.add(match[1]);
      }
    }
  } catch(e) {}
});

const depsArray = Array.from(allDeps);
console.log('Found dependencies:', depsArray);

if (depsArray.length > 0) {
  console.log('Installing dependencies in root...');
  execSync(`npm install ${depsArray.join(' ')}`, { stdio: 'inherit', cwd: __dirname });
}
