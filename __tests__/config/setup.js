import { beforeAll, afterAll } from 'vitest';
import { spawn } from 'child_process';
import { BASE_URL } from './constants.js';

let serverProcess;

async function waitForServer(url, timeout = 10000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      const res = await fetch(url);
      if (res.ok) {
        return true;
      }
    } catch {
      // Ignore errors while waiting for server
    }
    await new Promise((r) => setTimeout(r, 100));
  }
  throw new Error('Server did not start in under 20 seconds');
}

beforeAll(async () => {
  console.log('==== TEST RUN STARTED ====');
  console.log('Starting test server...');

  serverProcess = spawn('node', ['api/index.js'], {
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'test' },
  });
  await waitForServer(`${BASE_URL}/health`, 20000);
});

afterAll(() => {
  if (serverProcess) {
    serverProcess.kill();
    console.log('Server process terminated');
  }
  console.log('==== TEST RUN COMPLETED ====');
});
