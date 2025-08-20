import { vi, describe, it, expect } from 'vitest';
import * as client from '../api/client';
import * as graph from '../api/graph';

describe('graph module', () => {
  it('should export a default handler function', () => {
    expect(typeof graph.default).toBe('function');
  });

  it('should handle OPTIONS method', async () => {
    const req = { method: 'OPTIONS', query: {} };
    const res = {
      setHeader: vi.fn(),
      status: vi.fn().mockReturnThis(),
      end: vi.fn(),
      json: vi.fn(),
    };
    await graph.default(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.end).toHaveBeenCalled();
  });

  it('should reject non-GET methods', async () => {
    const req = { method: 'POST', query: {} };
    const res = {
      setHeader: vi.fn(),
      status: vi.fn().mockReturnThis(),
      end: vi.fn(),
      json: vi.fn(),
    };
    await graph.default(req, res);
    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.json).toHaveBeenCalledWith({ error: 'Method not allowed' });
  });

  it('should use default hours and maxReadings if query param is missing', async () => {
    const req = { method: 'GET', query: {} };
    const res = {
      setHeader: vi.fn(),
      status: vi.fn().mockReturnThis(),
      end: vi.fn(),
      json: vi.fn(),
    };
    const mockReadings = [
      { _datetime: '2025-08-19T14:45:00Z', _value: 120, _trend_info: 'Flat' },
      {
        _datetime: '2025-08-19T14:40:00Z',
        _value: 110,
        _trend_info: 'SingleUp',
      },
    ];
    vi.spyOn(client, 'initializeDexcomClient').mockReturnValue({
      getGlucoseReadings: async () => mockReadings,
    });
    await graph.default(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      count: mockReadings.length,
      hours: 2.0,
      readings: mockReadings.map((r) => ({
        time: r._datetime,
        value: r._value,
        trend: r._trend_info,
      })),
    });
    vi.restoreAllMocks();
  });

  it('should parse hours from query and calculate maxReadings', async () => {
    const req = { method: 'GET', query: { hours: '3' } };
    const res = {
      setHeader: vi.fn(),
      status: vi.fn().mockReturnThis(),
      end: vi.fn(),
      json: vi.fn(),
    };
    const mockReadings = [
      { _datetime: '2025-08-19T14:45:00Z', _value: 120, _trend_info: 'Flat' },
    ];
    vi.spyOn(client, 'initializeDexcomClient').mockReturnValue({
      getGlucoseReadings: async (maxReadings, minutes) => {
        expect(maxReadings).toBe(36); // 3 hours * 12 readings/hour
        expect(minutes).toBe(180);
        return mockReadings;
      },
    });
    await graph.default(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      count: mockReadings.length,
      hours: 3,
      readings: mockReadings.map((r) => ({
        time: r._datetime,
        value: r._value,
        trend: r._trend_info,
      })),
    });
    vi.restoreAllMocks();
  });

  it('should return 404 if no readings found', async () => {
    const req = { method: 'GET', query: {} };
    const res = {
      setHeader: vi.fn(),
      status: vi.fn().mockReturnThis(),
      end: vi.fn(),
      json: vi.fn(),
    };
    vi.spyOn(client, 'initializeDexcomClient').mockReturnValue({
      getGlucoseReadings: async () => [],
    });
    await graph.default(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      error: 'No glucose readings found',
    });
    vi.restoreAllMocks();
  });

  it('should handle errors and return 500', async () => {
    const req = { method: 'GET', query: {} };
    const res = {
      setHeader: vi.fn(),
      status: vi.fn().mockReturnThis(),
      end: vi.fn(),
      json: vi.fn(),
    };
    vi.spyOn(client, 'initializeDexcomClient').mockImplementation(() => {
      throw new Error('Dexcom error');
    });
    await graph.default(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Dexcom error' });
    vi.restoreAllMocks();
  });
});
