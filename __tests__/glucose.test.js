import { describe, it, expect } from 'vitest';
import { BASE_URL } from './config/constants.js';

describe('GET /glucose', () => {
  it('should return 200 OK and valid glucose response', async () => {
    const response = await fetch(`${BASE_URL}/glucose`);
    expect(response.ok).toBe(true);
    const data = await response.json();
    expect(data).toBeDefined();
  });
});
