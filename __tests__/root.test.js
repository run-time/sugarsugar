import { describe, it, expect } from 'vitest';
import { BASE_URL } from './config/constants.js';

describe('GET /', () => {
  it('should return 200 OK and valid root response', async () => {
    const response = await fetch(`${BASE_URL}/`);
    expect(response.ok).toBe(true);
    const data = await response.json();
    expect(data).toBeDefined();
    expect(data).toMatchSnapshot();
  });
});

describe('UI public/index.html', () => {
  it('should return 200 OK and render the landing page', async () => {
    const response = await fetch(`${BASE_URL}/index.html`);
    expect(response.ok).toBe(true);
    const html = await response.text();
    expect(html).toBeDefined();
    expect(html).toMatchSnapshot();
  });
});
