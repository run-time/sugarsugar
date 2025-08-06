#!/usr/bin/env node

import { spawn } from 'child_process';
import { setTimeout } from 'timers/promises';

// Simple test script to verify the API is working
let serverProcess = null;

async function isServerRunning(port = 3000) {
  try {
    const response = await fetch(`http://localhost:${port}/health`);
    return response.ok;
  } catch {
    return false;
  }
}

async function startServer() {
  return new Promise((resolve, reject) => {
    console.log('� Starting local development server...');
    serverProcess = spawn('node', ['api/index.js'], {
      stdio: ['inherit', 'pipe', 'pipe'],
      env: { ...process.env, NODE_ENV: 'development' },
    });

    let serverReady = false;

    serverProcess.stdout.on('data', (data) => {
      const output = data.toString();
      console.log(output.trim());
      if (
        output.includes('SugarSugar Local Dev Server running') &&
        !serverReady
      ) {
        serverReady = true;
        resolve();
      }
    });

    serverProcess.stderr.on('data', (data) => {
      console.error('Server error:', data.toString());
    });

    serverProcess.on('error', (error) => {
      reject(error);
    });

    // Timeout after 10 seconds
    setTimeout(10000).then(() => {
      if (!serverReady) {
        reject(new Error('Server failed to start within 10 seconds'));
      }
    });
  });
}

async function stopServer() {
  if (serverProcess) {
    console.log('\n� Stopping server...');
    serverProcess.kill();
    serverProcess = null;
  }
}

async function testEndpoint(url, name) {
  try {
    console.log(`\n\x1b[36m📊 Testing ${name}...\x1b[0m`);
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`\x1b[36mResponse from [${url}]\x1b[0m`);
    console.log(JSON.stringify(data, null, 2));
    console.log(`\x1b[32m✅ [PASS] ${name}\x1b[0m\n`);
    return true;
  } catch (error) {
    console.error(`\x1b[31m❌ [FAIL] ${name}\x1b[0m`);
    console.error('\x1b[31mError message:\x1b[0m');
    console.error(`\x1b[31m${error.message}\x1b[0m`);
    return false;
  }
}

async function testAPI() {
  let serverStartedByTest = false;

  try {
    console.log('\x1b[36mTesting SugarSugar API\x1b[0m\n');

    // Check if server is already running
    const serverRunning = await isServerRunning();

    if (!serverRunning) {
      console.log('\x1b[33m== Server not detected on port 3000 ==\x1b[0m\n');
      await startServer();
      serverStartedByTest = true;
      // Give the server a moment to fully initialize
      await setTimeout(2000);
    } else {
      console.log(
        '\x1b[36m== Server running on port 3000, proceeding with tests ==\x1b[0m\n',
      );
    }

    // Run tests
    const results = [];

    results.push(
      await testEndpoint('http://localhost:3000/health', 'health endpoint'),
    );
    results.push(await testEndpoint('http://localhost:3000/', 'root endpoint'));
    results.push(
      await testEndpoint(
        'http://localhost:3000/api/glucose',
        'glucose endpoint',
      ),
    );

    // Summary
    const passed = results.filter((r) => r).length;
    const total = results.length;

    console.log(
      `\n\x1b[36m== Test Summary: ${passed}/${total} tests passed ==\x1b[0m`,
    );

    if (passed === total) {
      console.log('\x1b[32m✅ All tests passed!\x1b[0m');
      process.exit(0);
    } else {
      console.log('\x1b[31m❌ Some tests failed\x1b[0m');
      process.exit(1);
    }
  } catch (error) {
    console.error('\x1b[31m❌ Test suite failed:\x1b[0m', error.message);
    process.exit(1);
  } finally {
    if (serverStartedByTest) {
      await stopServer();
    }
  }
}

// Handle cleanup on exit
process.on('SIGINT', async () => {
  await stopServer();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await stopServer();
  process.exit(0);
});

testAPI();
