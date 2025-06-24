#!/usr/bin/env node
// open-apps.js: Cross-platform replacement for open-apps.sh
const { exec } = require('child_process');

function openUrl(url) {
  let start;
  if (process.platform === 'darwin') {
    start = 'open';
  } else if (process.platform === 'win32') {
    start = 'start';
  } else {
    start = 'xdg-open';
  }
  exec(`${start} ${url}`);
}

openUrl('http://localhost:3000/');
openUrl('http://localhost:3001/');
