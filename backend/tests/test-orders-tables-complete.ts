import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  data?: any;
}

const results: TestResult[] = [];

async function testAPI() {
  console.log('🚀 Starting Comprehensive Order & Table API Tests\n');
  console.log('═══════════════════════════════════════════════════\n');

  let adminToken = '';
  let customerToken = '';
  let createdOrderId = '';
  let createdTableId = '';

  // Test 1: Admin Login
  try {
    console.log('1️⃣  Testing Admin Login...');
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@restaurant.com',
      password: 'admin123'
    });
    adminToken = response.data.token;
    results.push({
      name: 'Admin Login',
      passed: true,
      data: { email: response.data.user.email, role: response.data.user.role }
    });
    console.log('   ✅ Admin login successful\n');
  } catch (error: any) {
    results.push({
      name: 'Admin Login',
      passed: false,
      error: error.response?.data?.message || error.message
    });
    console.log('   ❌ Admin login failed\n');
  }

  // Test 2: Customer Login
  try {
    console.log('2️⃣  Testing Customer Login...');
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: 'customer@test.com',
      password: 'password123'
    });
    customerToken = response.data.token;
    results.push({
      name: 'Customer Login',
      passed: true,
      data: { email: response.data.user.email, role: response.data.user.role }
    });
    console.log('   ✅ Customer login successful\n');
  } catch (error: any) {
    results.push({
      name: 'Customer Login',
      passed: false,
      error: error.response?.data?.message || error.message
    });
    console.log('   ❌ Customer login failed\n');
  }

  // Test 3: Get All Tables
  try {
    console.log('3️⃣  Testing Get All Tables...');
    const response = await axios.get(`${API_URL}/tables`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    results.push({
      name: 'Get All Tables',
      passed: true,
      data: {
        count: response.data.count,
        tables: response.data.data.map((t: any) => ({
          number: t.number,
          capacity: t.capacity,
          status: t.status
        }))
      }
    });
    console.log(`   ✅ Found ${response.data.count} tables`);
    response.data.data.slice(0, 3).forEach((table: any) => {
      console.log(`      - Table ${table.number}: ${table.capacity} seats (${table.status})`);
    });
    console.log('');
  } catch (error: any) {
    results.push({
      name: 'Get All Tables',
      passed: false,
      error: error.response?.data?.message || error.message
    });
    console.log('   ❌ Failed to get tables\n');
  }

  // Test 4: Get Available Tables
  try {
    console.log('4️⃣  Testing Get Available Tables...');
    const response = await axios.get(`${API_URL}/tables/available?party_size=4`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    results.push({
      name: 'Get Available Tables (party_size=4)',
      passed: true,
      data: { count: response.data.count }
    });
    console.log(`   ✅ Found ${response.data.count} available tables for 4 people\n`);
  } catch (error: any) {
    results.push({
      name: 'Get Available Tables',
      passed: false,
      error: error.response?.data?.message || error.message
    });
    console.log('   ❌ Failed to get available tables\n');
  }

  // Test 5: Create Table (Admin only)
  try {
    console.log('5️⃣  Testing Create New Table (Admin)...');
    const response = await axios.post(
      `${API_URL}/tables`,
      {
        number: 'TEST' + Date.now(),
        capacity: 4,
        location: 'indoor',
        status: 'available'
      },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    createdTableId = response.data.data.id;
    results.push({
      name: 'Create Table',
      passed: true,
      data: { id: createdTableId, number: response.data.data.number }
    });
    console.log(`   ✅ Created table: ${response.data.data.number}\n`);
  } catch (error: any) {
    results.push({
      name: 'Create Table',
      passed: false,
      error: error.response?.data?.message || error.message
    });
    console.log('   ❌ Failed to create table\n');
  }

  // Test 6: Update Table Status
  if (createdTableId) {
    try {
      console.log('6️⃣  Testing Update Table Status...');
      const response = await axios.patch(
        `${API_URL}/tables/${createdTableId}/status`,
        { status: 'occupied' },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
      results.push({
        name: 'Update Table Status',
        passed: true,
        data: { status: response.data.data.status }
      });
      console.log('   ✅ Table status updated to occupied\n');
    } catch (error: any) {
      results.push({
        name: 'Update Table Status',
        passed: false,
        error: error.response?.data?.message || error.message
      });
      console.log('   ❌ Failed to update table status\n');
    }
  }

  // Test 7: Get All Orders (should be empty or have existing orders)
  try {
    console.log('7️⃣  Testing Get All Orders...');
    const response = await axios.get(`${API_URL}/orders`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    results.push({
      name: 'Get All Orders',
      passed: true,
      data: { count: response.data.data?.length || 0 }
    });
    console.log(`   ✅ Found ${response.data.data?.length || 0} orders\n`);
  } catch (error: any) {
    results.push({
      name: 'Get All Orders',
      passed: false,
      error: error.response?.data?.message || error.message
    });
    console.log('   ❌ Failed to get orders\n');
  }

  // Test 8: Create Order (Customer)
  try {
    console.log('8️⃣  Testing Create Order (Customer)...');
    const response = await axios.post(
      `${API_URL}/orders`,
      {
        order_type: 'dine_in',
        items: [
          {
            menu_item_id: '953882a2-da1f-46e4-bc44-1190308d81a2',
            quantity: 2,
            unit_price: 8.99
          }
        ],
        special_requests: 'Extra sauce please'
      },
      { headers: { Authorization: `Bearer ${customerToken}` } }
    );
    createdOrderId = response.data.data.id;
    results.push({
      name: 'Create Order',
      passed: true,
      data: {
        id: createdOrderId,
        status: response.data.data.status,
        total: response.data.data.total
      }
    });
    console.log(`   ✅ Order created: ${createdOrderId}`);
    console.log(`      Status: ${response.data.data.status}`);
    console.log(`      Total: $${response.data.data.total}\n`);
  } catch (error: any) {
    results.push({
      name: 'Create Order',
      passed: false,
      error: error.response?.data?.message || error.message
    });
    console.log('   ❌ Failed to create order\n');
  }

  // Test 9: Get Order by ID
  if (createdOrderId) {
    try {
      console.log('9️⃣  Testing Get Order by ID...');
      const response = await axios.get(`${API_URL}/orders/${createdOrderId}`, {
        headers: { Authorization: `Bearer ${customerToken}` }
      });
      results.push({
        name: 'Get Order by ID',
        passed: true,
        data: {
          id: response.data.data.id,
          status: response.data.data.status
        }
      });
      console.log('   ✅ Order retrieved successfully\n');
    } catch (error: any) {
      results.push({
        name: 'Get Order by ID',
        passed: false,
        error: error.response?.data?.message || error.message
      });
      console.log('   ❌ Failed to get order by ID\n');
    }
  }

  // Test 10: Update Order Status (Admin)
  if (createdOrderId) {
    try {
      console.log('🔟 Testing Update Order Status (Admin)...');
      const response = await axios.patch(
        `${API_URL}/orders/${createdOrderId}/status`,
        { status: 'confirmed' },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
      results.push({
        name: 'Update Order Status',
        passed: true,
        data: { status: response.data.data.status }
      });
      console.log('   ✅ Order status updated to confirmed\n');
    } catch (error: any) {
      results.push({
        name: 'Update Order Status',
        passed: false,
        error: error.response?.data?.message || error.message
      });
      console.log('   ❌ Failed to update order status\n');
    }
  }

  // Test 11: Get Customer Orders
  try {
    console.log('1️⃣1️⃣  Testing Get Customer Orders...');
    const response = await axios.get(`${API_URL}/orders/my`, {
      headers: { Authorization: `Bearer ${customerToken}` }
    });
    results.push({
      name: 'Get Customer Orders',
      passed: true,
      data: { count: response.data.data?.length || 0 }
    });
    console.log(`   ✅ Customer has ${response.data.data?.length || 0} orders\n`);
  } catch (error: any) {
    results.push({
      name: 'Get Customer Orders',
      passed: false,
      error: error.response?.data?.message || error.message
    });
    console.log('   ❌ Failed to get customer orders\n');
  }

  // Test 12: Delete Test Table (Cleanup)
  if (createdTableId) {
    try {
      console.log('1️⃣2️⃣  Testing Delete Table (Cleanup)...');
      await axios.delete(`${API_URL}/tables/${createdTableId}`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      results.push({
        name: 'Delete Table',
        passed: true
      });
      console.log('   ✅ Test table deleted\n');
    } catch (error: any) {
      results.push({
        name: 'Delete Table',
        passed: false,
        error: error.response?.data?.message || error.message
      });
      console.log('   ❌ Failed to delete table\n');
    }
  }

  // Test 13: Test Invalid Order Creation (Missing required fields)
  try {
    console.log('1️⃣3️⃣  Testing Invalid Order Creation (Error Handling)...');
    await axios.post(
      `${API_URL}/orders`,
      { order_type: 'dine-in' }, // Missing items
      { headers: { Authorization: `Bearer ${customerToken}` } }
    );
    results.push({
      name: 'Invalid Order Creation',
      passed: false,
      error: 'Should have failed but succeeded'
    });
    console.log('   ❌ Should have failed validation\n');
  } catch (error: any) {
    if (error.response?.status === 400) {
      results.push({
        name: 'Invalid Order Creation (Error Handling)',
        passed: true,
        data: { message: 'Correctly rejected invalid order' }
      });
      console.log('   ✅ Correctly rejected invalid order\n');
    } else {
      results.push({
        name: 'Invalid Order Creation',
        passed: false,
        error: error.message
      });
      console.log('   ❌ Unexpected error\n');
    }
  }

  // Test 14: Test Unauthorized Access
  try {
    console.log('1️⃣4️⃣  Testing Unauthorized Access (Security)...');
    await axios.get(`${API_URL}/orders`); // No token
    results.push({
      name: 'Unauthorized Access',
      passed: false,
      error: 'Should have been blocked'
    });
    console.log('   ❌ Should have been blocked\n');
  } catch (error: any) {
    if (error.response?.status === 401) {
      results.push({
        name: 'Unauthorized Access (Security)',
        passed: true,
        data: { message: 'Correctly blocked unauthorized request' }
      });
      console.log('   ✅ Correctly blocked unauthorized request\n');
    } else {
      results.push({
        name: 'Unauthorized Access',
        passed: false,
        error: error.message
      });
      console.log('   ❌ Unexpected error\n');
    }
  }

  // Print Summary
  console.log('\n═══════════════════════════════════════════════════');
  console.log('📊 TEST RESULTS SUMMARY\n');
  
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  const total = results.length;
  
  console.log(`Total Tests: ${total}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%\n`);

  if (failed > 0) {
    console.log('❌ FAILED TESTS:\n');
    results.filter(r => !r.passed).forEach(test => {
      console.log(`   - ${test.name}`);
      console.log(`     Error: ${test.error}\n`);
    });
  }

  console.log('═══════════════════════════════════════════════════\n');

  if (passed === total) {
    console.log('🎉 ALL TESTS PASSED! 🎉');
  } else {
    console.log('⚠️  SOME TESTS FAILED - Please review errors above');
  }

  process.exit(failed > 0 ? 1 : 0);
}

testAPI().catch(error => {
  console.error('💥 Test suite crashed:', error);
  process.exit(1);
});
