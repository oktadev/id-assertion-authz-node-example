#!/usr/bin/env node
// open-apps.js: Cross-platform replacement for open-apps.sh
import { exec } from 'child_process';

function openUrl(url) {
  let start;
  if (process.platform === 'darwin') {
    start = 'open';
  } else if (process.platform === 'win32') {
    start = 'start';
  } else {
    start = 'xdg-open';
  }
  exec(`${start} "${url}"`, (error, stdout, stderr) => {
    if (error) {
      console.error(`[open-apps] Failed to open ${url}:`, error.message);
    }
  });
}

console.log(
  '[open-apps] Opening http://localhost:3000/ and http://localhost:3001/ in your default browser...'
);
openUrl('http://localhost:3000/');
openUrl('http://localhost:3001/');
