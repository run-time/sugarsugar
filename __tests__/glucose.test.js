import { describe, it, expect, vi } from 'vitest';
import { BASE_URL } from './config/constants.js';
import * as glucose from '../api/glucose';
import * as client from '../api/client';

describe('GET /glucose', () => {
  it('should return 200 OK and valid glucose response', async () => {
    const response = await fetch(`${BASE_URL}/glucose`);
    expect(response.ok).toBe(true);
    const data = await response.json();
    expect(data).toBeDefined();
  });
  // Removed extra closing bracket
});
describe('glucose module', () => {
  it('should export a default handler function', () => {
    expect(typeof glucose.default).toBe('function');
  });

  it('should handle OPTIONS method', async () => {
    const req = { method: 'OPTIONS' };
    const res = {
      setHeader: vi.fn(),
      status: vi.fn().mockReturnThis(),
      end: vi.fn(),
      json: vi.fn(),
    };
    await glucose.default(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.end).toHaveBeenCalled();
  });

  it('should reject non-GET methods', async () => {
    const req = { method: 'POST' };
    const res = {
      setHeader: vi.fn(),
      status: vi.fn().mockReturnThis(),
      end: vi.fn(),
      json: vi.fn(),
    };
    await glucose.default(req, res);
    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.json).toHaveBeenCalledWith({ error: 'Method not allowed' });
  });

  it('should return 404 if no glucose reading found', async () => {
    const req = { method: 'GET' };
    const res = {
      setHeader: vi.fn(),
      status: vi.fn().mockReturnThis(),
      end: vi.fn(),
      json: vi.fn(),
    };
    vi.spyOn(client, 'initializeDexcomClient').mockReturnValue({
      getLatestGlucose: async () => null,
    });
    await glucose.default(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      error: 'No glucose reading found',
    });
    vi.restoreAllMocks();
  });

  it('should return 200 and glucose data on success', async () => {
    const req = { method: 'GET' };
    const res = {
      setHeader: vi.fn(),
      status: vi.fn().mockReturnThis(),
      end: vi.fn(),
      json: vi.fn(),
    };
    const mockReading = {
      _datetime: '2025-08-19T14:45:00Z',
      _value: 120,
      _previous_value: 110,
      _value_difference: 10,
      _trend_info: 'Flat',
      _status: 'OK',
      _time_ago: '1 min ago',
      _minutes_ago: 1,
    };
    vi.spyOn(client, 'initializeDexcomClient').mockReturnValue({
      getLatestGlucose: async () => mockReading,
    });
    await glucose.default(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      time: mockReading._datetime,
      value: mockReading._value,
      previous_value: mockReading._previous_value,
      value_difference: mockReading._value_difference,
      trend: mockReading._trend_info,
      status: mockReading._status,
      minutes_ago: mockReading._minutes_ago,
      last_reading: mockReading._time_ago,
    });
    vi.restoreAllMocks();
  });

  it('should handle errors and return 500', async () => {
    const req = { method: 'GET' };
    const res = {
      setHeader: vi.fn(),
      status: vi.fn().mockReturnThis(),
      end: vi.fn(),
      json: vi.fn(),
    };
    vi.spyOn(client, 'initializeDexcomClient').mockImplementation(() => {
      throw new Error('Dexcom error');
    });
    await glucose.default(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Dexcom error' });
    vi.restoreAllMocks();
  });
});
