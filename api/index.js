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

// Health check endpoint (matches health.js serverless function)
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'SugarSugar Dexcom API',
  });
});

// Health check endpoint for API route (matches health.js serverless function)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'SugarSugar Dexcom API',
  });
});

// Basic glucose endpoint (matches glucose.js serverless function)
app.get('/api/glucose', async (req, res) => {
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
      read: reading._time_ago,
      minutes_ago: reading._minutes_ago,
    });
  } catch (error) {
    console.error('Error fetching glucose:', error);
    res.status(500).json({
      error: error.message,
    });
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
      'GET /api/glucose': 'Get glucose reading (matches Vercel)',
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
    console.log(`🍭 SugarSugar Local Dev Server running on port ${port}`);
    console.log(`📊 Health check: http://localhost:${port}/health`);
    console.log(`🩸 Glucose data: http://localhost:${port}/api/glucose`);
    console.log(
      '⚠️  Note: Vercel uses serverless functions (health.js, glucose.js)',
    );
  });
}

export default app;
