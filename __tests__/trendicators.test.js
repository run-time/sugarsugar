import { describe, it, expect } from 'vitest';
import { BASE_URL } from './config/constants.js';

describe('UI public/trendicators.html', () => {
  it('should return 200 OK and render the expected HTML', async () => {
    const response = await fetch(`${BASE_URL}/trendicators.html`);
    expect(response.ok).toBe(true);
    const html = await response.text();
    expect(html).toBeDefined();
    expect(html).toMatchSnapshot();
  });
});
