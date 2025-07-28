#!/usr/bin/env node
// bootstrap.js: Cross-platform replacement for bootstrap.sh
import { execSync } from 'child_process';

function run(cmd) {
  execSync(cmd, { stdio: 'inherit' });
}

run('yarn install');
run('yarn postinstall');
run('yarn resetdb');
