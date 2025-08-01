#!/usr/bin/env node
// setup-env.js: Cross-platform replacement for setup-env.sh
import { copyFileSync, existsSync } from 'fs';

function copyIfNotExists(src, dest) {
  if (!existsSync(dest)) {
    copyFileSync(src, dest);
    return true;
  }
  return false;
}

const files = [
  ['packages/todo0/.env.default', 'packages/todo0/.env'],
  ['packages/wiki0/.env.default', 'packages/wiki0/.env'],
  ['packages/authorization-server/.env.wiki.default', 'packages/authorization-server/.env.wiki'],
  ['packages/authorization-server/.env.todo.default', 'packages/authorization-server/.env.todo'],
];

// Copy default env files if they do not exist
files.forEach(([src, dest]) => {
  if (existsSync(src)) {
    copyIfNotExists(src, dest);
  }
});

console.log('\n[setup:env] Default .env files copied (if not already present).');
console.log('Please edit the following files if needed (uncommon):');
console.log('  - packages/wiki0/.env');
console.log('  - packages/todo0/.env');
console.log('Please edit the following files to fill in required values:');
console.log('  - packages/authorization-server/.env.todo');
console.log('  - packages/authorization-server/.env.wiki');
console.log('Required fields: CUSTOMER1_AUTH_ISSUER, CUSTOMER1_CLIENT_ID, CUSTOMER1_CLIENT_SECRET');
