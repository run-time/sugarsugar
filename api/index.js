// LOCAL DEVELOPMENT SERVER ONLY -- This file is NOT used in Vercel deployments
// Vercel uses serverless functions: health.js and glucose.js

import express from 'express';
import dotenv from 'dotenv';
import SugarSugar from './sugarsugar.js';
import * as constants from './constants.js';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config({ path: '.env.vercel' });

const app = express();
const port = process.env.PORT || 3000;
const __dirname = dirname(fileURLToPath(import.meta.url));

// Basic middleware for local development
app.use(express.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept',
  );
  next();
});

// Shared client initialization (matches serverless functions)
let dexcomClient = null;

function initializeDexcomClient() {
  const username = process.env.DEXCOM_SHARE_USERNAME;
  const password = process.env.DEXCOM_SHARE_PASSWORD;
  const server = process.env.DEXCOM_SHARE_SERVER || 'US';
  const SERVER_INFO = { ...constants.SERVERS[server] };

  if (!username || !password) {
    throw new Error(
      'DEXCOM_SHARE_USERNAME and DEXCOM_SHARE_PASSWORD must be set in .env.local',
    );
  }

  if (!SERVER_INFO.code) {
    throw new Error(
      `Invalid DEXCOM_SHARE_SERVER: ${server}. Supported servers are: ${Object.keys(constants.SERVERS).join(', ')}`,
    );
  }

  return new SugarSugar(username, password, server);
}

// Health check endpoint for API route (matches health.js serverless function)
app.all('/health', (req, res) => {
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

  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'SugarSugar Dexcom API',
  });
});

// Basic glucose endpoint (matches glucose.js serverless function)
app.get('/glucose', async (req, res) => {
  try {
    if (!dexcomClient) {
      dexcomClient = initializeDexcomClient();
    }

    const reading = await dexcomClient.getLatestGlucose();

    if (!reading) {
      res.status(404).json({ error: 'No glucose reading found' });
      return;
    }

    res.json({
      time: reading._datetime,
      value: reading._value,
      previous_value: reading._previous_value,
      value_difference: reading._value_difference,
      trend: reading._trend_info,
      status: reading._status,
      minutes_ago: reading._minutes_ago,
      last_reading: reading._time_ago,
    });
  } catch (error) {
    console.error('Error fetching glucose:', error);
    res.status(500).json({
      error: error.message,
    });
  }
});

// Graph endpoint: get all readings for the last x hours (default 2 hours or 24 readings)
app.get('/graph', async (req, res) => {
  try {
    if (!dexcomClient) {
      dexcomClient = initializeDexcomClient();
    }

    // Parse hours from query, default to 2.0
    const hours = parseFloat(req.query.hours) || 2.0;
    if (isNaN(hours) || hours < 0.1 || hours > 24.0) {
      res
        .status(400)
        .json({ error: 'Invalid hours: must be between 0.1 and 24.0' });
      return;
    }

    // Dexcom readings are 5 minutes apart, so 12 readings per hour
    const maxReadings = parseInt(Math.round((hours * 60) / 5)) || 24;

    // We'll fetch readings for the last x hours (up to maxReadings)
    const readings = await dexcomClient.getGlucoseReadings(
      maxReadings,
      hours * 60,
    );

    if (!readings || readings.length === 0) {
      res.status(404).json({ error: 'No glucose readings found' });
      return;
    }

    // Map readings to a simple array for graphing
    const data = readings.map((r) => ({
      time: r._datetime,
      value: r._value,
      trend: r._trend_info,
    }));

    res.json({
      count: data.length,
      hours,
      readings: data,
    });
  } catch (error) {
    console.error('Error fetching graph data:', error);
    res.status(500).json({ error: error.message });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'SugarSugar API (Local Development)',
    description: 'Local development server - Vercel uses serverless functions',
    version: '1.0.0',
    note: 'This server is for local development only. Vercel deployment uses health.js and glucose.js',
    endpoints: {
      'GET /health': 'Service health check',
      'GET /glucose': 'Get last glucose reading',
      'GET /graph':
        'Get glucose readings for the last x hours (default 2 hours)',
    },
  });
});

// Simple error handling
app.use((error, req, res, _next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// Serve static files from public directory (after API routes)
app.use(express.static(join(__dirname, '../public')));

app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start local development server
if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(
      '\n===========================================================================',
    );
    console.log('🍭 SugarSugar 🍭');
    console.log(`Local Development Server running on port [${port}]`);
    console.log(
      '===========================================================================',
    );
    console.log(`🌐 Web Service Info: http://localhost:${port}/index.html`);
    console.log(`📊 CGM Examples: http://localhost:${port}/examples/cgm.html`);
    console.log(
      `📱 Alexa Example: http://localhost:${port}/examples/alexa.html`,
    );
    console.log(
      '---------------------------------------------------------------------------',
    );
    console.log(`🌳 Root / response: http://localhost:${port}/`);
    console.log(`🆗 Service /health check: http://localhost:${port}/health`);
    console.log(`🩸 Latest /glucose reading: http://localhost:${port}/glucose`);
    console.log(`📈 Recent /graph data: http://localhost:${port}/graph`);
    console.log('');
    console.log(
      '⚠️  Note: Vercel uses serverless functions (health.js, glucose.js, graph.js)',
    );
    console.log(
      '===========================================================================\n',
    );
  });
}

export default app;
