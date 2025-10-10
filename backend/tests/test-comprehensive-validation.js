// Comprehensive API validation test suite
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';
const RESTAURANT_ID = 'f46275c0-9917-44fc-b144-e1e9cff89075';

let testResults = {
  passed: 0,
  failed: 0,
  tests: []
};

function logTest(name, passed, details = '') {
  const status = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${status}: ${name}`);
  if (details) console.log(`   ${details}`);
  
  testResults.tests.push({ name, passed, details });
  if (passed) testResults.passed++;
  else testResults.failed++;
}

async function testEndpoint(name, method, url, data, expectedStatus, shouldSucceed = true) {
  try {
    const config = { method, url, data, validateStatus: () => true };
    const response = await axios(config);
    
    if (response.status === expectedStatus) {
      if (shouldSucceed && response.data.success) {
        logTest(name, true, `Status: ${response.status}`);
        return response.data;
      } else if (!shouldSucceed && !response.data.success) {
        logTest(name, true, `Correctly rejected: ${response.data.message}`);
        return response.data;
      } else {
        logTest(name, false, `Unexpected success value: ${response.data.success}`);
        return null;
      }
    } else {
      logTest(name, false, `Expected ${expectedStatus}, got ${response.status}`);
      return null;
    }
  } catch (error) {
    logTest(name, false, `Error: ${error.message}`);
    return null;
  }
}

async function runTests() {
  console.log('🧪 Starting Comprehensive API Validation Tests\n');
  console.log('='.repeat(60));
  console.log('\n📋 1. GET TABLES TESTS\n');
  
  // Test 1: Get all tables
  await testEndpoint(
    'Get all tables',
    'GET',
    `${BASE_URL}/restaurants/${RESTAURANT_ID}/tables`,
    null,
    200,
    true
  );
  
  console.log('\n📋 2. CREATE TABLE VALIDATION TESTS\n');
  
  // Test 2: Create table without number (should fail)
  await testEndpoint(
    'Create table without number',
    'POST',
    `${BASE_URL}/restaurants/${RESTAURANT_ID}/tables`,
    { capacity: 4, status: 'available' },
    400,
    false
  );
  
  // Test 3: Create table without capacity (should fail)
  await testEndpoint(
    'Create table without capacity',
    'POST',
    `${BASE_URL}/restaurants/${RESTAURANT_ID}/tables`,
    { number: 'T999', status: 'available' },
    400,
    false
  );
  
  // Test 4: Create table with invalid capacity (should fail)
  await testEndpoint(
    'Create table with negative capacity',
    'POST',
    `${BASE_URL}/restaurants/${RESTAURANT_ID}/tables`,
    { number: 'T999', capacity: -5, status: 'available' },
    400,
    false
  );
  
  // Test 5: Create table with invalid status (should fail)
  await testEndpoint(
    'Create table with invalid status',
    'POST',
    `${BASE_URL}/restaurants/${RESTAURANT_ID}/tables`,
    { number: 'T999', capacity: 4, status: 'invalid_status' },
    400,
    false
  );
  
  // Test 6: Create table with valid data (should succeed)
  const newTable = await testEndpoint(
    'Create table with valid data',
    'POST',
    `${BASE_URL}/restaurants/${RESTAURANT_ID}/tables`,
    { 
      number: 'TEST-001', 
      capacity: 4, 
      status: 'available',
      location: 'Test Area',
      position: { x: 500, y: 500 }
    },
    201,
    true
  );
  
  const createdTableId = newTable?.data?.id;
  
  console.log('\n📋 3. UPDATE TABLE VALIDATION TESTS\n');
  
  if (createdTableId) {
    // Test 7: Update with invalid capacity (should fail)
    await testEndpoint(
      'Update table with invalid capacity',
      'PUT',
      `${BASE_URL}/restaurants/${RESTAURANT_ID}/tables/${createdTableId}`,
      { capacity: 0 },
      400,
      false
    );
    
    // Test 8: Update with invalid status (should fail)
    await testEndpoint(
      'Update table with invalid status',
      'PUT',
      `${BASE_URL}/restaurants/${RESTAURANT_ID}/tables/${createdTableId}`,
      { status: 'invalid' },
      400,
      false
    );
    
    // Test 9: Update with valid data (should succeed)
    await testEndpoint(
      'Update table with valid data',
      'PUT',
      `${BASE_URL}/restaurants/${RESTAURANT_ID}/tables/${createdTableId}`,
      { capacity: 6, status: 'reserved', location: 'Updated Area' },
      200,
      true
    );
  }
  
  console.log('\n📋 4. TABLE STATUS VALIDATION TESTS\n');
  
  if (createdTableId) {
    // Test 10: Update status without status field (should fail)
    await testEndpoint(
      'Update status without status field',
      'PATCH',
      `${BASE_URL}/restaurants/${RESTAURANT_ID}/tables/${createdTableId}/status`,
      {},
      400,
      false
    );
    
    // Test 11: Update status with invalid value (should fail)
    await testEndpoint(
      'Update status with invalid value',
      'PATCH',
      `${BASE_URL}/restaurants/${RESTAURANT_ID}/tables/${createdTableId}/status`,
      { status: 'wrong_status' },
      400,
      false
    );
    
    // Test 12: Update status with valid value (should succeed)
    await testEndpoint(
      'Update status with valid value',
      'PATCH',
      `${BASE_URL}/restaurants/${RESTAURANT_ID}/tables/${createdTableId}/status`,
      { status: 'occupied' },
      200,
      true
    );
  }
  
  console.log('\n📋 5. POSITION VALIDATION TESTS\n');
  
  if (createdTableId) {
    // Test 13: Update position without position field (should fail)
    await testEndpoint(
      'Update position without position field',
      'PATCH',
      `${BASE_URL}/restaurants/${RESTAURANT_ID}/tables/${createdTableId}/position`,
      {},
      400,
      false
    );
    
    // Test 14: Update position with invalid coordinates (should fail)
    await testEndpoint(
      'Update position with non-numeric coordinates',
      'PATCH',
      `${BASE_URL}/restaurants/${RESTAURANT_ID}/tables/${createdTableId}/position`,
      { position: { x: 'abc', y: 100 } },
      400,
      false
    );
    
    // Test 15: Update position with valid coordinates (should succeed)
    await testEndpoint(
      'Update position with valid coordinates',
      'PATCH',
      `${BASE_URL}/restaurants/${RESTAURANT_ID}/tables/${createdTableId}/position`,
      { position: { x: 600, y: 600 } },
      200,
      true
    );
  }
  
  console.log('\n📋 6. BULK UPDATE VALIDATION TESTS\n');
  
  // Test 16: Bulk update with empty array (should fail)
  await testEndpoint(
    'Bulk update with empty array',
    'PATCH',
    `${BASE_URL}/restaurants/${RESTAURANT_ID}/tables/positions/bulk`,
    { positions: [] },
    400,
    false
  );
  
  // Test 17: Bulk update with invalid data (should fail)
  await testEndpoint(
    'Bulk update with invalid data',
    'PATCH',
    `${BASE_URL}/restaurants/${RESTAURANT_ID}/tables/positions/bulk`,
    { positions: [{ id: 'test', position: { x: 'invalid' } }] },
    400,
    false
  );
  
  console.log('\n📋 7. AVAILABILITY CHECK VALIDATION TESTS\n');
  
  // Test 18: Availability without date (should fail)
  await testEndpoint(
    'Check availability without date',
    'GET',
    `${BASE_URL}/restaurants/${RESTAURANT_ID}/tables/availability/check?time=18:00`,
    null,
    400,
    false
  );
  
  // Test 19: Availability with invalid date format (should fail)
  await testEndpoint(
    'Check availability with invalid date format',
    'GET',
    `${BASE_URL}/restaurants/${RESTAURANT_ID}/tables/availability/check?date=2025/10/05&time=18:00`,
    null,
    400,
    false
  );
  
  // Test 20: Availability with invalid time format (should fail)
  await testEndpoint(
    'Check availability with invalid time format',
    'GET',
    `${BASE_URL}/restaurants/${RESTAURANT_ID}/tables/availability/check?date=2025-10-05&time=25:00`,
    null,
    400,
    false
  );
  
  // Test 21: Availability with valid params (should succeed)
  await testEndpoint(
    'Check availability with valid params',
    'GET',
    `${BASE_URL}/restaurants/${RESTAURANT_ID}/tables/availability/check?date=2025-10-05&time=18:00`,
    null,
    200,
    true
  );
  
  console.log('\n📋 8. ANALYTICS VALIDATION TESTS\n');
  
  // Test 22: Analytics without dates (should fail)
  await testEndpoint(
    'Get analytics without dates',
    'GET',
    `${BASE_URL}/restaurants/${RESTAURANT_ID}/tables/analytics/stats`,
    null,
    400,
    false
  );
  
  // Test 23: Analytics with invalid date format (should fail)
  await testEndpoint(
    'Get analytics with invalid date format',
    'GET',
    `${BASE_URL}/restaurants/${RESTAURANT_ID}/tables/analytics/stats?start_date=2025/01/01&end_date=2025-12-31`,
    null,
    400,
    false
  );
  
  // Test 24: Analytics with invalid date range (should fail)
  await testEndpoint(
    'Get analytics with end_date before start_date',
    'GET',
    `${BASE_URL}/restaurants/${RESTAURANT_ID}/tables/analytics/stats?start_date=2025-12-31&end_date=2025-01-01`,
    null,
    400,
    false
  );
  
  // Test 25: Analytics with valid dates (should succeed)
  await testEndpoint(
    'Get analytics with valid dates',
    'GET',
    `${BASE_URL}/restaurants/${RESTAURANT_ID}/tables/analytics/stats?start_date=2025-01-01&end_date=2025-12-31`,
    null,
    200,
    true
  );
  
  console.log('\n📋 9. 404 ERROR TESTS\n');
  
  // Test 26: Get non-existent table (should fail with 404)
  await testEndpoint(
    'Get non-existent table',
    'GET',
    `${BASE_URL}/restaurants/${RESTAURANT_ID}/tables/non-existent-id`,
    null,
    404,
    false
  );
  
  // Test 27: Update non-existent table (should fail with 404)
  await testEndpoint(
    'Update non-existent table',
    'PUT',
    `${BASE_URL}/restaurants/${RESTAURANT_ID}/tables/non-existent-id`,
    { capacity: 6 },
    404,
    false
  );
  
  // Test 28: Delete non-existent table (should fail with 404)
  await testEndpoint(
    'Delete non-existent table',
    'DELETE',
    `${BASE_URL}/restaurants/${RESTAURANT_ID}/tables/non-existent-id`,
    null,
    404,
    false
  );
  
  console.log('\n📋 10. CLEANUP\n');
  
  // Test 29: Delete test table
  if (createdTableId) {
    await testEndpoint(
      'Delete test table',
      'DELETE',
      `${BASE_URL}/restaurants/${RESTAURANT_ID}/tables/${createdTableId}`,
      null,
      200,
      true
    );
  }
  
  // Final summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📝 Total:  ${testResults.passed + testResults.failed}`);
  console.log(`📈 Success Rate: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(2)}%`);
  console.log('='.repeat(60));
  
  if (testResults.failed > 0) {
    console.log('\n❌ FAILED TESTS:');
    testResults.tests.filter(t => !t.passed).forEach(t => {
      console.log(`   - ${t.name}: ${t.details}`);
    });
  }
  
  process.exit(testResults.failed > 0 ? 1 : 0);
}

runTests().catch(error => {
  console.error('❌ Test suite failed:', error.message);
  process.exit(1);
});
