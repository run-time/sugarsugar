// Test script for /api/graph endpoint
// Usage: node test-graph-api.js

import http from 'http';

const hours = 62; // Change to test other values
const url = `http://localhost:3000/api/graph?hours=${hours}`;

http
  .get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    res.on('end', () => {
      console.log('Status:', res.statusCode);
      console.log('Response:', data);
    });
  })
  .on('error', (err) => {
    console.error('Error:', err.message);
  });
