#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

function start(name, command, args, cwd) {
    console.log(`\n> Starting ${name} in ${cwd}`);
    const proc = spawn(command, args, {
        cwd,
        stdio: 'inherit',
        shell: true,
    });
    proc.on('error', err => {
        console.error(`${name} failed to start:`, err);
    });
    proc.on('exit', code => {
        console.log(`${name} exited with code ${code}`);
    });
}

// Directories
const projectRoot = process.cwd();
const backendDir = path.join(projectRoot, 'backend');
const frontendDir = path.join(projectRoot, 'frontend');

// Kick off both at once
start('Backend', 'node', ['server.js'], backendDir);
start('Frontend', 'npm', ['start'], frontendDir);
