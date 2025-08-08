import { initializeDexcomClient } from './client.js';

// Vercel serverless function for glucose data
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const dexcomClient = initializeDexcomClient();

    // Parse hours from query, default to 2.0
    const hours = parseFloat(req.query.hours) || 2.0;

    // Dexcom readings are 5 minutes apart, so 12 readings per hour
    const maxReadings = parseInt(Math.round((hours * 60) / 5)) || 24;

    // We'll fetch readings for the last x hours (up to maxReadings)
    const readings = await dexcomClient.getGlucoseReadings(maxReadings, hours * 60);

    if (!readings || readings.length === 0) {
      res.status(404).json({ error: 'No glucose readings found' });
      return;
    }

    // Map readings to a simple array for graphing
    const data = readings.map(r => ({
      time: r._datetime,
      value: r._value,
      trend: r._trend_info
    }));

    res.status(200).json({
      count: data.length,
      hours,
      readings: data,
    });
  } catch (error) {
    console.error('Error fetching graph data:', error);
    res.status(500).json({ error: error.message });
  }
}
