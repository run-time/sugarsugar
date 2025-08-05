import SugarSugar from './sugarsugar.js';
import * as constants from './constants.js';

function initializeDexcomClient() {
  const username = process.env.DEXCOM_SHARE_USERNAME;
  const password = process.env.DEXCOM_SHARE_PASSWORD;
  const server = process.env.DEXCOM_SHARE_SERVER || 'US';
  const SERVER_INFO = { ...constants.SERVERS[server] };

  if (!username || !password) {
    throw new Error(
      'DEXCOM_SHARE_USERNAME and DEXCOM_SHARE_PASSWORD must be set as environment variables',
    );
  }

  if (!SERVER_INFO.code) {
    throw new Error(
      `Invalid DEXCOM_SHARE_SERVER: ${server}. Supported servers are: ${Object.keys(constants.SERVERS).join(', ')}`,
    );
  }

  return new SugarSugar(username, password, server);
}

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
    const reading = await dexcomClient.getLatestGlucose();

    if (!reading) {
      res.status(404).json({ error: 'No glucose reading found' });
      return;
    }

    res.status(200).json({
      time: reading._datetime,
      value: reading._value,
      previous_value: reading._previous_value,
      value_difference: reading._value_difference,
      trend: reading._trend_info,
      status: reading._status,
      read: reading._time_ago,
    });
  } catch (error) {
    console.error('Error fetching glucose:', error);
    res.status(500).json({
      error: error.message,
    });
  }
}
