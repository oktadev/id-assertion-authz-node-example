#!/usr/bin/env node
// bootstrap.js: Cross-platform replacement for bootstrap.sh
const { execSync } = require('child_process');

function run(cmd) {
  execSync(cmd, { stdio: 'inherit' });
}

run('node scripts/setup-env.js');
run('yarn install');
run('yarn postinstall');
run('yarn resetdb');
