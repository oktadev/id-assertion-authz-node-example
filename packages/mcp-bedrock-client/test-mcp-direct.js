#!/usr/bin/env node

// Simple test to verify MCP server can be called directly
const { spawn } = require('child_process');
const fs = require('fs');

console.log('🔍 Testing MCP Server Direct Communication');

// Start the server
const serverProcess = spawn('node', ['dist/mcp-server/reminder-server.js'], {
  stdio: ['pipe', 'pipe', 'pipe']
});

let responseReceived = false;

// Handle server output
serverProcess.stdout.on('data', (data) => {
  console.log('📤 Server STDOUT:', data.toString());
  responseReceived = true;
});

serverProcess.stderr.on('data', (data) => {
  console.log('📋 Server STDERR:', data.toString());
});

serverProcess.on('close', (code) => {
  console.log(`🔚 Server closed with code: ${code}`);
  process.exit(code);
});

// Wait for server to start
setTimeout(() => {
  console.log('📤 Sending tools/list request...');
  
  // Send tools/list request
  const toolsListRequest = {
    jsonrpc: "2.0",
    id: 1,
    method: "tools/list"
  };
  
  serverProcess.stdin.write(JSON.stringify(toolsListRequest) + '\n');
  
  setTimeout(() => {
    console.log('📤 Sending tools/call request...');
    
    // Send tools/call request
    const toolsCallRequest = {
      jsonrpc: "2.0",
      id: 2,
      method: "tools/call",
      params: {
        name: "print_env_variables",
        arguments: {}
      }
    };
    
    serverProcess.stdin.write(JSON.stringify(toolsCallRequest) + '\n');
    
    // Check for debug files after a few seconds
    setTimeout(() => {
      console.log('🔍 Checking for debug files...');
      
      const debugFiles = fs.readdirSync('/tmp').filter(f => f.startsWith('reminder-server-debug-'));
      console.log(`Found ${debugFiles.length} debug files:`, debugFiles);
      
      debugFiles.forEach(file => {
        const content = fs.readFileSync(`/tmp/${file}`, 'utf8');
        console.log(`📋 Debug file ${file}:`, content);
      });
      
      // Clean up
      serverProcess.kill();
    }, 3000);
  }, 1000);
}, 1000);

// Timeout after 10 seconds
setTimeout(() => {
  console.log('⏰ Timeout reached');
  serverProcess.kill();
  process.exit(1);
}, 10000);
