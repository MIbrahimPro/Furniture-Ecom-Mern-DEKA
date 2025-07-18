#!/usr/bin/env node

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

function runSync(cmd, cwd = process.cwd()) {
    console.log(`> ${cmd}`);
    execSync(cmd, { stdio: 'inherit', cwd, shell: true });
}

function spawnProcess(name, cmd, args, cwd) {
    console.log(`\n> Starting ${name}: ${cmd} ${args.join(' ')} (cwd: ${cwd})`);
    const proc = spawn(cmd, args, { cwd, stdio: 'inherit', shell: true });
    proc.on('error', err => console.error(`${name} failed:`, err));
    proc.on('exit', code => console.log(`${name} exited with code ${code}`));
}

// 0. Define directories
const projectRoot = process.cwd();
const backendDir = path.join(projectRoot, 'backend');
const frontendDir = path.join(projectRoot, 'frontend');

// 1. Check Node.js
try {
    execSync('node -v', { stdio: 'ignore', shell: true });
} catch {
    console.error('Node.js is not installed. Please install from https://nodejs.org/');
    process.exit(1);
}

// 2. Check MongoDB
try {
    execSync('mongod --version', { stdio: 'ignore', shell: true });
} catch {
    console.error('MongoDB is not installed. Please install from https://www.mongodb.com/try/download/community');
    process.exit(1);
}

// 3. Install dependencies
console.log('\nInstalling backend dependencies...');
runSync('npm install', backendDir);

console.log('\nInstalling frontend dependencies...');
runSync('npm install', frontendDir);

// 4. Create .env
const envPath = path.join(backendDir, '.env');
const envContent = `MONGODB_URI=mongodb://localhost:27017/deka
JWT_SECRET=Somesecretlongandsecuretextusedforjwttoken
PORT=5000
`;
fs.writeFileSync(envPath, envContent);
console.log(`\n.env file created at ${envPath}`);

// 5. Seed database
console.log('\nSeeding database...');
runSync('node script/seed.js', backendDir);

// 6. Start both servers in parallel
console.log('\nLaunching servers...');
spawnProcess('Backend', 'npx', ['nodemon', 'server.js'], backendDir);
spawnProcess('Frontend', 'npm', ['start'], frontendDir);

// 7. Final summary
console.log('\n\n\n\n\n\n');
console.log('\x1b[34m========================================\x1b[0m');
console.log('\x1b[34mDEKA INITIALIZATION COMPLETE!           \x1b[0m');
console.log('\x1b[34m----------------------------------------\x1b[0m');
console.log('\x1b[34mUser Credentials:                       \x1b[0m');
console.log('\x1b[34m  • admin@admin.com    | pswd1          \x1b[0m');
console.log('\x1b[34m  • john@example.com   | UserPass123    \x1b[0m');
console.log('\x1b[34m  • jane@example.com   | UserPass123    \x1b[0m');
console.log('\x1b[34m  • peter@example.com  | UserPass123    \x1b[0m');
console.log('\x1b[34m  • mary@example.com   | UserPass123    \x1b[0m');
console.log('\x1b[34m----------------------------------------\x1b[0m');
console.log('\x1b[34mTo restart later:                       \x1b[0m');
console.log('\x1b[34m  node run.js                           \x1b[0m');
console.log('\x1b[34m========================================\x1b[0m');
