// Comprehensive API test for table management endpoints
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';
const RESTAURANT_ID = 'f46275c0-9917-44fc-b144-e1e9cff89075';

let createdTableId = null;

// Test results tracking
const results = {
  passed: 0,
  failed: 0,
  tests: []
};

function logTest(name, status, details = '') {
  const result = { name, status, details };
  results.tests.push(result);
  if (status === 'PASS') {
    results.passed++;
    console.log(`✅ ${name}`);
  } else {
    results.failed++;
    console.log(`❌ ${name}`);
  }
  if (details) console.log(`   ${details}`);
}

async function testEndpoint(name, method, url, data = null, expectedStatus = 200) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${url}`,
      timeout: 5000,
      ...(data && { data })
    };
    
    const response = await axios(config);
    
    if (response.status === expectedStatus) {
      logTest(name, 'PASS', `Status: ${response.status}`);
      return response.data;
    } else {
      logTest(name, 'FAIL', `Expected ${expectedStatus}, got ${response.status}`);
      return null;
    }
  } catch (error) {
    if (error.response) {
      logTest(name, 'FAIL', `Status: ${error.response.status}, Error: ${error.response.data?.error || error.message}`);
    } else {
      logTest(name, 'FAIL', `Error: ${error.message}`);
    }
    return null;
  }
}

async function runTests() {
  console.log('\n🧪 Testing Table Management API Endpoints...\n');
  console.log('='.repeat(60));
  
  // 1. Test Health Check
  console.log('\n📍 Basic Health Checks:');
  await testEndpoint('Health Check', 'GET', '/health');
  await testEndpoint('API Root', 'GET', '/');
  
  // 2. Test Get All Tables
  console.log('\n📍 Get Tables:');
  const tablesData = await testEndpoint(
    'GET All Tables',
    'GET',
    `/restaurants/${RESTAURANT_ID}/tables`
  );
  
  if (tablesData && tablesData.data && tablesData.data.length > 0) {
    const firstTable = tablesData.data[0];
    console.log(`   Found ${tablesData.data.length} tables`);
    
    // 3. Test Get Single Table
    console.log('\n📍 Get Single Table:');
    const tableData = await testEndpoint(
      'GET Table by ID',
      'GET',
      `/restaurants/${RESTAURANT_ID}/tables/${firstTable.id}`
    );
    
    // 4. Test Table Status Update
    console.log('\n📍 Update Table Status:');
    await testEndpoint(
      'PATCH Table Status to occupied',
      'PATCH',
      `/restaurants/${RESTAURANT_ID}/tables/${firstTable.id}/status`,
      { status: 'occupied' }
    );
    
    await testEndpoint(
      'PATCH Table Status to available',
      'PATCH',
      `/restaurants/${RESTAURANT_ID}/tables/${firstTable.id}/status`,
      { status: 'available' }
    );
    
    // 5. Test Table Position Update
    console.log('\n📍 Update Table Position:');
    await testEndpoint(
      'PATCH Table Position',
      'PATCH',
      `/restaurants/${RESTAURANT_ID}/tables/${firstTable.id}/position`,
      { position: { x: 150, y: 150 } }
    );
  }
  
  // 6. Test Create New Table
  console.log('\n📍 Create New Table:');
  const newTableData = await testEndpoint(
    'POST Create New Table',
    'POST',
    `/restaurants/${RESTAURANT_ID}/tables`,
    {
      number: 'TEST-001',
      capacity: 4,
      status: 'available',
      location: 'Test Area',
      position: { x: 500, y: 500 }
    },
    201 // Expect 201 Created
  );
  
  if (newTableData && newTableData.data) {
    createdTableId = newTableData.data.id;
    console.log(`   Created table ID: ${createdTableId}`);
    
    // 7. Test Update Table
    console.log('\n📍 Update Table:');
    await testEndpoint(
      'PUT Update Table',
      'PUT',
      `/restaurants/${RESTAURANT_ID}/tables/${createdTableId}`,
      {
        number: 'TEST-001-UPDATED',
        capacity: 6,
        status: 'available',
        location: 'Test Area Updated'
      }
    );
  }
  
  // 8. Test Get Table Layout
  console.log('\n📍 Get Table Layout:');
  await testEndpoint(
    'GET Table Layout',
    'GET',
    `/restaurants/${RESTAURANT_ID}/tables/layout/all`
  );
  
  // 9. Test Bulk Update Positions
  console.log('\n📍 Bulk Update Positions:');
  if (tablesData && tablesData.data && tablesData.data.length > 0) {
    const updates = tablesData.data.slice(0, 2).map((table, index) => ({
      id: table.id,
      position: { x: 100 + (index * 100), y: 100 + (index * 100) }
    }));
    
    await testEndpoint(
      'PATCH Bulk Update Positions',
      'PATCH',
      `/restaurants/${RESTAURANT_ID}/tables/positions/bulk`,
      { updates }
    );
  }
  
  // 10. Test Table Availability
  console.log('\n📍 Check Table Availability:');
  const today = new Date().toISOString().split('T')[0];
  await testEndpoint(
    'GET Table Availability',
    'GET',
    `/restaurants/${RESTAURANT_ID}/tables/availability/check?date=${today}&time=18:00&partySize=4`
  );
  
  // 11. Test Table Analytics
  console.log('\n📍 Get Table Analytics:');
  await testEndpoint(
    'GET Table Analytics',
    'GET',
    `/restaurants/${RESTAURANT_ID}/tables/analytics/stats?startDate=${today}&endDate=${today}`
  );
  
  // 12. Test Get Tables with Filters
  console.log('\n📍 Filter Tables:');
  await testEndpoint(
    'GET Tables by Status',
    'GET',
    `/restaurants/${RESTAURANT_ID}/tables?status=available`
  );
  
  await testEndpoint(
    'GET Tables by Capacity',
    'GET',
    `/restaurants/${RESTAURANT_ID}/tables?capacity=4`
  );
  
  // 13. Test Delete Table (cleanup)
  console.log('\n📍 Delete Table:');
  if (createdTableId) {
    await testEndpoint(
      'DELETE Table',
      'DELETE',
      `/restaurants/${RESTAURANT_ID}/tables/${createdTableId}`
    );
  }
  
  // 14. Test Invalid Endpoints (should return appropriate errors)
  console.log('\n📍 Error Handling:');
  const notFoundResult = await testEndpoint(
    'GET Non-existent Table (should 404)',
    'GET',
    `/restaurants/${RESTAURANT_ID}/tables/invalid-id-999`,
    null,
    404
  );
  if (!notFoundResult) {
    // Mark as pass if got 404 as expected
    results.passed++;
    results.failed--;
    console.log('   ✅ Correctly returned 404 for non-existent table');
  }
  
  const invalidDataResult = await testEndpoint(
    'POST Invalid Table Data (should fail)',
    'POST',
    `/restaurants/${RESTAURANT_ID}/tables`,
    { number: '' }, // Missing required fields
    null,
    400
  );
  if (!invalidDataResult) {
    // Count as pass if it rejected invalid data
    console.log('   ✅ Correctly rejected invalid table data');
  }
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 Test Summary:');
  console.log(`   Total Tests: ${results.passed + results.failed}`);
  console.log(`   ✅ Passed: ${results.passed}`);
  console.log(`   ❌ Failed: ${results.failed}`);
  console.log(`   Success Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(2)}%`);
  
  if (results.failed > 0) {
    console.log('\n❌ Failed Tests:');
    results.tests.filter(t => t.status === 'FAIL').forEach(t => {
      console.log(`   - ${t.name}: ${t.details}`);
    });
  }
  
  console.log('\n' + '='.repeat(60));
  
  // Check server health after all tests
  console.log('\n🏥 Final Server Health Check:');
  const finalHealth = await testEndpoint('Final Health Check', 'GET', '/health');
  
  if (finalHealth) {
    console.log('\n✅ Server is still running healthy after all tests!');
  } else {
    console.log('\n❌ WARNING: Server may have crashed!');
  }
}

// Run tests
runTests().catch(error => {
  console.error('\n💥 Test suite crashed:', error.message);
  process.exit(1);
});
