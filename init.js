#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function run(cmd) {
  console.log(`> ${cmd}`);
  execSync(cmd, { stdio: 'inherit' });
}

// 0. Define directories
const projectRoot = process.cwd();
const backendDir = path.join(projectRoot, 'backend');
const frontendDir = path.join(projectRoot, 'frontend');

// 1. Check Node.js
try {
  execSync('node -v');
} catch (err) {
  console.error('Node.js is not installed. Please install from https://nodejs.org/');
  process.exit(1);
}

// 2. Check MongoDB
try {
  execSync('mongod --version');
} catch (err) {
  console.error('MongoDB is not installed. Please install from https://www.mongodb.com/try/download/community');
  process.exit(1);
}

// 3. Install dependencies in backend and frontend
console.log('Installing backend dependencies...');
process.chdir(backendDir);
run('npm install');
console.log('Installing frontend dependencies...');
process.chdir(frontendDir);
run('npm install');

// Return to project root
process.chdir(projectRoot);

// 4. Create .env
const envContent = `MONGODB_URI=mongodb://localhost:27017/deka
JWT_SECRET=Somesecretlongandsecuretextusedforjwttoken
PORT=5000
`;
fs.writeFileSync(path.join(backendDir, '.env'), envContent);
console.log('.env file created');

// 5. Seed database
process.chdir(backendDir);
run('node script/seed.js');

// 6. Start servers
console.log('Starting backend and frontend...');
process.chdir(backendDir);
run('npx nodemon server.js &');
process.chdir(frontendDir);
run('npm start');

// 7. Final summary
console.log('\n\n');
console.log('\x1b[34m========================================\x1b[0m');
console.log('\x1b[34mDEKA INITIALIZATION COMPLETE!           \x1b[0m');
console.log('\x1b[34m----------------------------------------\x1b[0m');
console.log('\x1b[34mUser Credentials:                      \x1b[0m');
console.log('\x1b[34m  • admin@admin.com    | pswd1        \x1b[0m');
console.log('\x1b[34m  • john@example.com   | UserPass123  \x1b[0m');
console.log('\x1b[34m  • jane@example.com   | UserPass123  \x1b[0m');
console.log('\x1b[34m  • peter@example.com  | UserPass123  \x1b[0m');
console.log('\x1b[34m  • mary@example.com   | UserPass123  \x1b[0m');
console.log('\x1b[34m----------------------------------------\x1b[0m');
console.log('\x1b[34mTo restart later:                       \x1b[0m');
console.log('\x1b[34m  node scripts/run.js                   \x1b[0m');
console.log('\x1b[34m========================================\x1b[0m');
