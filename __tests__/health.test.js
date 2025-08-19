import { describe, it, expect } from 'vitest';
import { BASE_URL } from './config/constants.js';

describe('GET /health', () => {
  it('should return 200 OK and valid health response', async () => {
    const response = await fetch(`${BASE_URL}/health`);
    expect(response.ok).toBe(true);
    const data = await response.json();
    expect(data).toBeDefined();
    // ...existing code...
  });
});
