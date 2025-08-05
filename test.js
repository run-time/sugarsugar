#!/usr/bin/env node

// Simple test script to verify the API is working
async function testAPI() {
  try {
    console.log('🧪 Testing SugarSugar API...\n');

    // Test health endpoint
    console.log('📊 Testing health endpoint...');
    const healthResponse = await fetch('http://localhost:3000/health');
    const healthData = await healthResponse.json();
    console.log('✅ Health:', JSON.stringify(healthData, null, 2));

    // Test root endpoint
    console.log('\n📋 Testing root endpoint...');
    const rootResponse = await fetch('http://localhost:3000/');
    const rootData = await rootResponse.json();
    console.log('✅ Root:', JSON.stringify(rootData, null, 2));

    // Test glucose endpoint
    console.log('\n⚙️ Testing glucose endpoint...');
    const glucoseResponse = await fetch('http://localhost:3000/api/glucose');
    const glucoseData = await glucoseResponse.json();
    console.log('✅ Glucose:', JSON.stringify(glucoseData, null, 2));
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAPI();
