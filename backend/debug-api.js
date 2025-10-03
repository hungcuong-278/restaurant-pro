// Simple API test with better error handling
const { default: fetch } = require('node-fetch');

async function testWithErrorDetails() {
  try {
    console.log('Testing API with detailed error handling...\n');
    
    const url = 'http://localhost:5000/api/restaurants/f46275c0-9917-44fc-b144-e1e9cff89075/tables';
    console.log('🔗 Calling:', url);
    
    const response = await fetch(url);
    console.log('📡 Response status:', response.status);
    console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));
    
    const text = await response.text();
    console.log('📝 Raw response:', text);
    
    try {
      const json = JSON.parse(text);
      console.log('📋 Parsed JSON:', JSON.stringify(json, null, 2));
    } catch (parseError) {
      console.log('❌ JSON parse error:', parseError.message);
    }
    
  } catch (error) {
    console.error('❌ Request failed:', error.message);
    console.error('📚 Full error:', error);
  }
}

testWithErrorDetails();