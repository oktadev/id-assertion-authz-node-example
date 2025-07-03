#!/usr/bin/env node
// open-apps.js: Cross-platform replacement for open-apps.sh
import { exec } from 'child_process';

const urls = ['http://localhost:3000/', 'http://localhost:3001/'];

function isDevContainerOrHeadless() {
  // Detect VS Code Dev Container, Codespaces, or headless Linux
  return (
    process.env.CODESPACES === 'true' ||
    process.env.DEVCONTAINER === 'true' ||
    process.env.VSCODE_REMOTE_CONTAINERS === 'true' ||
    (process.platform === 'linux' && !process.env.DISPLAY)
  );
}

if (isDevContainerOrHeadless()) {
  console.log('[open-apps] Detected dev container Environment.');
  console.log('[open-apps] Please open these URLs manually in your browser:');
  urls.forEach((url) => console.log(`  ${url}`));
  process.exit(0);
}

function openUrl(url, onError) {
  let start;
  if (process.platform === 'darwin') {
    start = 'open';
  } else if (process.platform === 'win32') {
    start = 'start';
  } else {
    start = 'xdg-open';
  }
  exec(`${start} "${url}"`, (error) => {
    if (error) {
      onError(url);
    }
  });
}

let hadError = false;

urls.forEach((url) => {
  openUrl(url, () => {
    hadError = true;
  });
});

// Wait a moment and print a single error message if any failed
setTimeout(() => {
  if (hadError) {
    console.error(
      `\n[open-apps] Could not open one or more URLs automatically.\nPlease open these URLs manually in your browser:\n  ${urls.join(
        '\n  '
      )}\n`
    );
  }
}, 1000);
