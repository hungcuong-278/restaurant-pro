/**
 * Quick API Test Script for Task 3.7
 * Run with: node test-api-quick.js
 */

const RESTAURANT_ID = '64913af3-e39a-4dd0-ad21-c3bb4aa6e9a5';
const BASE_URL = 'http://localhost:5000/api';

// Test results tracking
let passed = 0;
let failed = 0;
const results = [];

// Helper function to make requests
async function testEndpoint(name, method, url, body = null) {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };
    
    if (body) {
      options.body = JSON.stringify(body);
    }

    console.log(`\n🧪 Testing: ${name}`);
    console.log(`   ${method} ${url}`);
    
    const response = await fetch(url, options);
    const data = await response.json();
    
    if (response.ok) {
      console.log(`   ✅ PASS - Status: ${response.status}`);
      passed++;
      results.push({ name, status: 'PASS', code: response.status });
      return { success: true, data, status: response.status };
    } else {
      console.log(`   ❌ FAIL - Status: ${response.status}`);
      console.log(`   Error: ${data.message || 'Unknown error'}`);
      failed++;
      results.push({ name, status: 'FAIL', code: response.status, error: data.message });
      return { success: false, data, status: response.status };
    }
  } catch (error) {
    console.log(`   ❌ FAIL - ${error.message}`);
    failed++;
    results.push({ name, status: 'FAIL', error: error.message });
    return { success: false, error: error.message };
  }
}

// Main test function
async function runTests() {
  console.log('='.repeat(60));
  console.log('🧪 API TESTING SUITE - Task 3.7');
  console.log('='.repeat(60));
  console.log(`Restaurant ID: ${RESTAURANT_ID}`);
  console.log(`Base URL: ${BASE_URL}`);
  console.log('='.repeat(60));

  // Test 1: Health Check
  await testEndpoint(
    'Health Check',
    'GET',
    `${BASE_URL}/health`
  );

  // Test 2: Get All Orders
  const ordersResult = await testEndpoint(
    'Get All Orders',
    'GET',
    `${BASE_URL}/restaurants/${RESTAURANT_ID}/orders`
  );

  let testOrderId = null;
  if (ordersResult.success && ordersResult.data.data?.length > 0) {
    testOrderId = ordersResult.data.data[0].id;
    console.log(`   📝 Found test order: ${testOrderId.slice(0, 8)}`);
  }

  // Test 3: Get Single Order
  if (testOrderId) {
    await testEndpoint(
      'Get Order Details',
      'GET',
      `${BASE_URL}/restaurants/${RESTAURANT_ID}/orders/${testOrderId}`
    );

    // Test 4: Get Order Payments
    await testEndpoint(
      'Get Order Payments',
      'GET',
      `${BASE_URL}/restaurants/${RESTAURANT_ID}/orders/${testOrderId}/payments`
    );

    // Test 5: Get Payment Status
    await testEndpoint(
      'Get Payment Status',
      'GET',
      `${BASE_URL}/restaurants/${RESTAURANT_ID}/orders/${testOrderId}/payment-summary`
    );

    // Test 6: Get Receipt (HTML)
    console.log(`\n🧪 Testing: Get Receipt HTML`);
    console.log(`   GET ${BASE_URL}/restaurants/${RESTAURANT_ID}/orders/${testOrderId}/receipt`);
    try {
      const response = await fetch(`${BASE_URL}/restaurants/${RESTAURANT_ID}/orders/${testOrderId}/receipt`);
      if (response.ok && response.headers.get('content-type')?.includes('text/html')) {
        console.log(`   ✅ PASS - Status: ${response.status}, Content-Type: text/html`);
        passed++;
        results.push({ name: 'Get Receipt HTML', status: 'PASS', code: response.status });
      } else {
        console.log(`   ❌ FAIL - Status: ${response.status}`);
        failed++;
        results.push({ name: 'Get Receipt HTML', status: 'FAIL', code: response.status });
      }
    } catch (error) {
      console.log(`   ❌ FAIL - ${error.message}`);
      failed++;
      results.push({ name: 'Get Receipt HTML', status: 'FAIL', error: error.message });
    }

    // Test 7: Get Receipt (Text)
    console.log(`\n🧪 Testing: Get Receipt Text`);
    console.log(`   GET ${BASE_URL}/restaurants/${RESTAURANT_ID}/orders/${testOrderId}/receipt/text`);
    try {
      const response = await fetch(`${BASE_URL}/restaurants/${RESTAURANT_ID}/orders/${testOrderId}/receipt/text`);
      if (response.ok && response.headers.get('content-type')?.includes('text/plain')) {
        console.log(`   ✅ PASS - Status: ${response.status}, Content-Type: text/plain`);
        passed++;
        results.push({ name: 'Get Receipt Text', status: 'PASS', code: response.status });
      } else {
        console.log(`   ❌ FAIL - Status: ${response.status}`);
        failed++;
        results.push({ name: 'Get Receipt Text', status: 'FAIL', code: response.status });
      }
    } catch (error) {
      console.log(`   ❌ FAIL - ${error.message}`);
      failed++;
      results.push({ name: 'Get Receipt Text', status: 'FAIL', error: error.message });
    }

    // Test 8: Get Receipt Data (JSON)
    await testEndpoint(
      'Get Receipt Data',
      'GET',
      `${BASE_URL}/restaurants/${RESTAURANT_ID}/orders/${testOrderId}/receipt/data`
    );
  }

  // Test 9: Get Menu Items (needed for order creation)
  await testEndpoint(
    'Get Menu Items',
    'GET',
    `${BASE_URL}/menu/items`
  );

  // Test 10: Get Tables
  await testEndpoint(
    'Get Tables',
    'GET',
    `${BASE_URL}/restaurants/${RESTAURANT_ID}/tables`
  );

  // Print Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST RESULTS SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Pass Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
  console.log('='.repeat(60));

  // Detailed Results
  console.log('\n📋 Detailed Results:');
  results.forEach((result, index) => {
    const icon = result.status === 'PASS' ? '✅' : '❌';
    console.log(`${icon} ${index + 1}. ${result.name} - ${result.status} (${result.code || 'N/A'})`);
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
  });

  console.log('\n' + '='.repeat(60));
  console.log('🎉 API Testing Complete!');
  console.log('='.repeat(60));
}

// Run tests
runTests().catch(console.error);
