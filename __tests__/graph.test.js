import { describe, it, expect } from 'vitest';
import { BASE_URL } from './config/constants.js';

describe('GET /graph', () => {
  it('should return 200 OK and valid graph response', async () => {
    const response = await fetch(`${BASE_URL}/graph`);
    expect(response.ok).toBe(true);
    const data = await response.json();
    expect(data).toBeDefined();
  });
});
