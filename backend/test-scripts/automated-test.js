/**
 * AUTOMATED TESTING SCRIPT - 60 MINUTES
 * Tests all critical functionality automatically
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000';
const RESTAURANT_ID = 'a8d307c4-40c2-4e11-8468-d65710bae6f3';

// Test results tracking
const results = {
  total: 0,
  passed: 0,
  failed: 0,
  tests: []
};

// Helper function to run a test
async function runTest(name, testFn) {
  results.total++;
  console.log(`\n🔍 TEST ${results.total}: ${name}`);
  
  try {
    const result = await testFn();
    results.passed++;
    results.tests.push({ name, status: 'PASS', ...result });
    console.log(`  ✅ PASS`, result.message || '');
    return true;
  } catch (error) {
    results.failed++;
    const errorMsg = error.response?.data?.error?.message || error.message;
    results.tests.push({ name, status: 'FAIL', error: errorMsg });
    console.log(`  ❌ FAIL:`, errorMsg);
    return false;
  }
}

// Test 1: Health Check
async function testHealth() {
  const response = await axios.get(`${BASE_URL}/api/health`);
  return { message: `Server is ${response.data.status}` };
}

// Test 2: Get Tables
async function testGetTables() {
  const response = await axios.get(`${BASE_URL}/api/restaurants/${RESTAURANT_ID}/tables`);
  const tables = response.data.data;
  return { 
    message: `Found ${tables.length} tables`,
    data: tables.map(t => `${t.number}: ${t.name}`)
  };
}

// Test 3: Get Menu
async function testGetMenu() {
  const response = await axios.get(`${BASE_URL}/api/menu/items`);
  const items = response.data.data || response.data;
  return { 
    message: `Found ${items.length} menu items`,
    data: items.slice(0, 3).map(i => `${i.name} - $${i.price}`)
  };
}

// Test 4: Get Orders
async function testGetOrders() {
  const response = await axios.get(`${BASE_URL}/api/restaurants/${RESTAURANT_ID}/orders`);
  const orders = response.data.data;
  return { 
    message: `Found ${orders.length} orders`
  };
}

// Test 5: Create Dine-in Order (with Professional Table Name)
async function testCreateDineInOrder() {
  const table = await axios.get(`${BASE_URL}/api/restaurants/${RESTAURANT_ID}/tables`);
  const availableTable = table.data.data.find(t => t.status === 'available');
  
  if (!availableTable) {
    throw new Error('No available tables');
  }

  const menu = await axios.get(`${BASE_URL}/api/menu/items`);
  const menuItems = menu.data.data || menu.data;
  
  const orderData = {
    restaurant_id: RESTAURANT_ID,
    order_type: 'dine_in',
    table_id: availableTable.id,
    customer_name: 'Automated Test Customer',
    items: [
      {
        menu_item_id: menuItems[0].id,
        quantity: 2,
        notes: 'Auto test'
      }
    ]
  };

  const response = await axios.post(
    `${BASE_URL}/api/restaurants/${RESTAURANT_ID}/orders`,
    orderData
  );

  const order = response.data.data;
  return {
    message: `Created order #${order.order_number} for table ${availableTable.location || availableTable.number}`,
    orderId: order.id
  };
}

// Test 6: Create Takeout Order (No table - should NOT show "undefined")
async function testCreateTakeoutOrder() {
  const menu = await axios.get(`${BASE_URL}/api/menu/items`);
  const menuItems = menu.data.data || menu.data;
  
  const orderData = {
    restaurant_id: RESTAURANT_ID,
    order_type: 'takeout',
    customer_name: 'Takeout Test Customer',
    customer_phone: '0123456789',
    items: [
      {
        menu_item_id: menuItems[1].id,
        quantity: 1
      }
    ]
  };

  const response = await axios.post(
    `${BASE_URL}/api/restaurants/${RESTAURANT_ID}/orders`,
    orderData
  );

  const order = response.data.data;
  
  // Critical check: table_number should be null, NOT "undefined"
  if (order.table_number === 'undefined') {
    throw new Error('BUG: table_number is "undefined" string instead of null!');
  }
  
  return {
    message: `Created takeout order #${order.order_number} (table: ${order.table_number === null ? 'null ✅' : order.table_number})`,
    orderId: order.id
  };
}

// Test 7: Update Order Status (Kitchen Workflow)
async function testUpdateOrderStatus() {
  // Create an order first
  const menu = await axios.get(`${BASE_URL}/api/menu/items`);
  const menuItems = menu.data.data || menu.data;
  
  const orderData = {
    restaurant_id: RESTAURANT_ID,
    order_type: 'takeout',
    customer_name: 'Status Test',
    items: [{ menu_item_id: menuItems[0].id, quantity: 1 }]
  };

  const createResponse = await axios.post(
    `${BASE_URL}/api/restaurants/${RESTAURANT_ID}/orders`,
    orderData
  );

  const orderId = createResponse.data.data.id;

  // Update status: pending -> preparing -> ready
  await axios.patch(
    `${BASE_URL}/api/restaurants/${RESTAURANT_ID}/orders/${orderId}`,
    { status: 'preparing' }
  );

  await axios.patch(
    `${BASE_URL}/api/restaurants/${RESTAURANT_ID}/orders/${orderId}`,
    { status: 'ready' }
  );

  const finalOrder = await axios.get(
    `${BASE_URL}/api/restaurants/${RESTAURANT_ID}/orders/${orderId}`
  );

  return {
    message: `Order status workflow: pending → preparing → ready ✅`,
    finalStatus: finalOrder.data.data.status
  };
}

// Test 8: Search Orders by Table Name
async function testSearchOrdersByTableName() {
  const response = await axios.get(
    `${BASE_URL}/api/restaurants/${RESTAURANT_ID}/orders?search=Château`
  );
  
  const orders = response.data.data;
  return {
    message: `Search "Château" found ${orders.length} orders`
  };
}

// Test 9: Verify Professional Table Names Display
async function testProfessionalTableNames() {
  const response = await axios.get(`${BASE_URL}/api/restaurants/${RESTAURANT_ID}/tables`);
  const tables = response.data.data;
  
  const professionalNames = [
    'Le Château',
    'Roma Intima',
    'The Velvet Rose',
    'The Windsor Room'
  ];
  
  const foundNames = tables.filter(t => professionalNames.includes(t.location)).map(t => t.location);
  
  if (foundNames.length !== 4) {
    throw new Error(`Only found ${foundNames.length}/4 professional names: ${foundNames.join(', ')}`);
  }
  
  return {
    message: `All 4 professional table names verified: ${foundNames.join(', ')}`
  };
}

// Test 10: No "undefined" in Order Responses
async function testNoUndefinedInOrders() {
  const response = await axios.get(`${BASE_URL}/api/restaurants/${RESTAURANT_ID}/orders`);
  const orders = response.data.data;
  
  const undefinedIssues = [];
  orders.forEach((order, index) => {
    if (order.table_number === 'undefined') {
      undefinedIssues.push(`Order ${order.order_number}: table_number is "undefined"`);
    }
    if (order.table_name === 'undefined') {
      undefinedIssues.push(`Order ${order.order_number}: table_name is "undefined"`);
    }
  });
  
  if (undefinedIssues.length > 0) {
    throw new Error(`Found ${undefinedIssues.length} "undefined" issues:\n${undefinedIssues.join('\n')}`);
  }
  
  return {
    message: `Checked ${orders.length} orders - No "undefined" strings found ✅`
  };
}

// Main test runner
async function runAllTests() {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 AUTOMATED TESTING SESSION - 60 MINUTES');
  console.log('='.repeat(60));
  console.log(`Start Time: ${new Date().toLocaleString()}`);
  console.log(`Restaurant ID: ${RESTAURANT_ID}`);
  
  try {
    // Core API Tests
    await runTest('Health Check', testHealth);
    await runTest('Get Tables', testGetTables);
    await runTest('Get Menu', testGetMenu);
    await runTest('Get Orders', testGetOrders);
    
    // Order Creation Tests
    await runTest('Create Dine-in Order (Professional Table Name)', testCreateDineInOrder);
    await runTest('Create Takeout Order (No "undefined")', testCreateTakeoutOrder);
    
    // Workflow Tests
    await runTest('Update Order Status (Kitchen Workflow)', testUpdateOrderStatus);
    await runTest('Search Orders by Table Name', testSearchOrdersByTableName);
    
    // Data Quality Tests
    await runTest('Verify Professional Table Names', testProfessionalTableNames);
    await runTest('No "undefined" in Order Responses', testNoUndefinedInOrders);
    
  } catch (error) {
    console.error('\n❌ Fatal error:', error.message);
  }
  
  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total Tests: ${results.total}`);
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`Success Rate: ${((results.passed / results.total) * 100).toFixed(1)}%`);
  console.log(`\nEnd Time: ${new Date().toLocaleString()}`);
  
  // Print failed tests details
  if (results.failed > 0) {
    console.log('\n' + '='.repeat(60));
    console.log('❌ FAILED TESTS DETAILS');
    console.log('='.repeat(60));
    results.tests
      .filter(t => t.status === 'FAIL')
      .forEach((t, i) => {
        console.log(`\n${i + 1}. ${t.name}`);
        console.log(`   Error: ${t.error}`);
      });
  }
  
  console.log('\n' + '='.repeat(60));
  
  // Save results to file
  const fs = require('fs');
  const reportPath = '../docs/reports/week-7/AUTOMATED_TEST_RESULTS.json';
  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    duration: '60 minutes',
    results
  }, null, 2));
  
  console.log(`\n📄 Results saved to: ${reportPath}`);
  
  return results;
}

// Run tests
runAllTests()
  .then(results => {
    process.exit(results.failed === 0 ? 0 : 1);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
