import { describe, it, expect } from 'vitest';
import { BASE_URL } from './config/constants.js';

import * as health from '../api/health';
import handler from '../api/health.js';
import { vi } from 'vitest';

describe('health.js direct handler', () => {
  function createMockRes() {
    return {
      setHeader: vi.fn(),
      status: vi.fn(function (code) {
        this._status = code;
        return this;
      }),
      json: vi.fn(function (data) {
        this._json = data;
        return this;
      }),
      end: vi.fn(),
      _status: undefined,
      _json: undefined,
    };
  }

  it('handles OPTIONS request', async () => {
    const req = { method: 'OPTIONS' };
    const res = createMockRes();
    await handler(req, res);
    expect(res.setHeader).toHaveBeenCalledWith(
      'Access-Control-Allow-Origin',
      '*',
    );
    expect(res.setHeader).toHaveBeenCalledWith(
      'Access-Control-Allow-Methods',
      'GET, POST, OPTIONS',
    );
    expect(res.setHeader).toHaveBeenCalledWith(
      'Access-Control-Allow-Headers',
      'Content-Type',
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.end).toHaveBeenCalled();
  });

  it('handles non-GET method', async () => {
    const req = { method: 'POST' };
    const res = createMockRes();
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.json).toHaveBeenCalledWith({ error: 'Method not allowed' });
  });

  it('handles GET method', async () => {
    const req = { method: 'GET' };
    const res = createMockRes();
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json.mock.calls[0][0].status).toBe('ok');
    expect(res.json.mock.calls[0][0].service).toBe('SugarSugar Dexcom API');
    expect(typeof res.json.mock.calls[0][0].timestamp).toBe('string');
  });
});
describe('health module', () => {
  it('should have expected exports', () => {
    expect(typeof health).toBe('object');
  });
});

describe('GET /health', () => {
  it('should return 200 OK and valid health response', async () => {
    const response = await fetch(`${BASE_URL}/health`);
    expect(response.ok).toBe(true);
    const data = await response.json();
    expect(data).toBeDefined();
    expect(data.status).toBe('ok');
    expect(data.service).toBe('SugarSugar Dexcom API');
    expect(typeof data.timestamp).toBe('string');
  });
});

describe('OPTIONS /health', () => {
  it('should return 200 OK for OPTIONS request', async () => {
    const response = await fetch(`${BASE_URL}/health`, { method: 'OPTIONS' });
    expect(response.status).toBe(200);
  });
});

describe('Non-GET /health', () => {
  it('should return 405 for POST request', async () => {
    const response = await fetch(`${BASE_URL}/health`, { method: 'POST' });
    expect(response.status).toBe(405);
    const data = await response.json();
    expect(data.error).toBe('Method not allowed');
  });
  it('should return 405 for PUT request', async () => {
    const response = await fetch(`${BASE_URL}/health`, { method: 'PUT' });
    expect(response.status).toBe(405);
    const data = await response.json();
    expect(data.error).toBe('Method not allowed');
  });
});
