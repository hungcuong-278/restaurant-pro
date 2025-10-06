/**
 * 🧪 TABLE MANAGEMENT TESTING
 * 
 * Tests all table-related endpoints
 * Run: node test-table-api.js
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';
const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  bold: '\x1b[1m'
};

let adminToken = '';
let restaurantId = '';
let testTableId = '';

function log(message, color = 'reset') {
  console.log(`${COLORS[color]}${message}${COLORS.reset}`);
}

function success(message) {
  log(`✅ ${message}`, 'green');
}

function error(message) {
  log(`❌ ${message}`, 'red');
}

function info(message) {
  log(`ℹ️  ${message}`, 'blue');
}

function section(title) {
  log(`\n${'='.repeat(60)}`, 'yellow');
  log(`  ${title}`, 'bold');
  log(`${'='.repeat(60)}`, 'yellow');
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Test 1: Login as Admin
async function testLogin() {
  section('TEST 1: ADMIN LOGIN');
  
  try {
    info('Logging in as admin...');
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@restaurant.com',
      password: 'admin123'
    });
    
    if (response.data.success && response.data.token) {
      adminToken = response.data.token;
      success(`Admin login successful: ${response.data.user.email}`);
      return true;
    } else {
      throw new Error('Admin login failed');
    }
  } catch (err) {
    error(`Login failed: ${err.response?.data?.message || err.message}`);
    return false;
  }
}

// Test 2: Get Restaurant ID
async function testGetRestaurant() {
  section('TEST 2: GET RESTAURANT');
  
  try {
    info('Fetching restaurant from database...');
    // Use debug endpoint or direct query
    const sqlite3 = require('sqlite3').verbose();
    const db = new sqlite3.Database('./database/dev.sqlite3');
    
    return new Promise((resolve, reject) => {
      db.get('SELECT id, name FROM restaurants LIMIT 1', (err, row) => {
        if (err) {
          error(`Database error: ${err.message}`);
          resolve(false);
          return;
        }
        
        if (row) {
          restaurantId = row.id;
          success(`Restaurant found: ${row.name}`);
          success(`  ID: ${restaurantId}`);
          db.close();
          resolve(true);
        } else {
          error('No restaurant found in database');
          db.close();
          resolve(false);
        }
      });
    });
  } catch (err) {
    error(`Get restaurant failed: ${err.message}`);
    // Fallback: use hardcoded ID
    restaurantId = 'a8d307c4-40c2-4e11-8468-d65710bae6f3';
    info(`Using fallback restaurant ID: ${restaurantId}`);
    return true;
  }
}

// Test 3: Get All Tables
async function testGetAllTables() {
  section('TEST 3: GET ALL TABLES');
  
  try {
    info(`Fetching tables for restaurant: ${restaurantId}`);
    const response = await axios.get(
      `${BASE_URL}/restaurants/${restaurantId}/tables`,
      {
        headers: { Authorization: `Bearer ${adminToken}` }
      }
    );
    
    if (response.data.success && Array.isArray(response.data.data)) {
      success(`Found ${response.data.data.length} tables`);
      
      response.data.data.forEach((table, index) => {
        info(`\n  Table ${index + 1}:`);
        info(`    Number: ${table.number}`);
        info(`    Capacity: ${table.capacity} guests`);
        info(`    Location: ${table.location || 'N/A'}`);
        info(`    Status: ${table.status}`);
        
        // Save first table ID for later tests
        if (index === 0) {
          testTableId = table.id;
        }
      });
      
      return true;
    } else {
      error('Failed to get tables');
      return false;
    }
  } catch (err) {
    error(`Get tables failed: ${err.response?.data?.message || err.message}`);
    return false;
  }
}

// Test 4: Get Single Table
async function testGetTableById() {
  section('TEST 4: GET TABLE BY ID');
  
  if (!testTableId) {
    error('No test table ID available');
    return false;
  }
  
  try {
    info(`Fetching table: ${testTableId}`);
    const response = await axios.get(
      `${BASE_URL}/restaurants/${restaurantId}/tables/${testTableId}`,
      {
        headers: { Authorization: `Bearer ${adminToken}` }
      }
    );
    
    if (response.data.success && response.data.data) {
      const table = response.data.data;
      success('Table details retrieved!');
      info(`  Number: ${table.number}`);
      info(`  Capacity: ${table.capacity}`);
      info(`  Status: ${table.status}`);
      info(`  Location: ${table.location || 'N/A'}`);
      return true;
    } else {
      error('Failed to get table');
      return false;
    }
  } catch (err) {
    error(`Get table failed: ${err.response?.data?.message || err.message}`);
    return false;
  }
}

// Test 5: Create New Table
async function testCreateTable() {
  section('TEST 5: CREATE NEW TABLE');
  
  try {
    info('Creating new table...');
    const newTable = {
      number: `TEST-${Date.now()}`,
      capacity: 4,
      location: 'Test Area',
      status: 'available',
      position: { x: 500, y: 500 },
      notes: 'Created by automated test'
    };
    
    const response = await axios.post(
      `${BASE_URL}/restaurants/${restaurantId}/tables`,
      newTable,
      {
        headers: { Authorization: `Bearer ${adminToken}` }
      }
    );
    
    if (response.data.success && response.data.data) {
      success('Table created successfully!');
      success(`  Number: ${response.data.data.number}`);
      success(`  ID: ${response.data.data.id}`);
      
      // Save for cleanup
      testTableId = response.data.data.id;
      return true;
    } else {
      error('Table creation failed');
      return false;
    }
  } catch (err) {
    error(`Create table failed: ${err.response?.data?.message || err.message}`);
    if (err.response?.data?.errors) {
      console.log('Validation errors:', err.response.data.errors);
    }
    return false;
  }
}

// Test 6: Update Table
async function testUpdateTable() {
  section('TEST 6: UPDATE TABLE');
  
  if (!testTableId) {
    error('No test table ID available');
    return false;
  }
  
  try {
    info(`Updating table: ${testTableId}`);
    const updateData = {
      capacity: 6,
      location: 'VIP Section',
      notes: 'Updated by automated test'
    };
    
    const response = await axios.put(
      `${BASE_URL}/restaurants/${restaurantId}/tables/${testTableId}`,
      updateData,
      {
        headers: { Authorization: `Bearer ${adminToken}` }
      }
    );
    
    if (response.data.success) {
      success('Table updated successfully!');
      success(`  New capacity: ${response.data.data.capacity}`);
      success(`  New location: ${response.data.data.location}`);
      return true;
    } else {
      error('Update failed');
      return false;
    }
  } catch (err) {
    error(`Update table failed: ${err.response?.data?.message || err.message}`);
    return false;
  }
}

// Test 7: Change Table Status
async function testChangeTableStatus() {
  section('TEST 7: CHANGE TABLE STATUS');
  
  if (!testTableId) {
    error('No test table ID available');
    return false;
  }
  
  const statuses = ['available', 'occupied', 'reserved', 'available'];
  let passedTests = 0;
  
  for (const status of statuses) {
    try {
      info(`Setting status to: ${status}`);
      const response = await axios.put(
        `${BASE_URL}/restaurants/${restaurantId}/tables/${testTableId}`,
        { status },
        {
          headers: { Authorization: `Bearer ${adminToken}` }
        }
      );
      
      if (response.data.success && response.data.data.status === status) {
        success(`  ✓ Status changed to ${status}`);
        passedTests++;
      }
      
      await sleep(300);
    } catch (err) {
      error(`  ✗ Failed to set status ${status}: ${err.message}`);
    }
  }
  
  log(`\n📊 Status Tests: ${passedTests}/${statuses.length} passed`, 'blue');
  return passedTests === statuses.length;
}

// Test 8: Filter Tables by Status
async function testFilterTablesByStatus() {
  section('TEST 8: FILTER TABLES BY STATUS');
  
  const statuses = ['available', 'occupied', 'reserved'];
  let passedTests = 0;
  
  for (const status of statuses) {
    try {
      info(`Filtering tables with status: ${status}`);
      const response = await axios.get(
        `${BASE_URL}/restaurants/${restaurantId}/tables?status=${status}`,
        {
          headers: { Authorization: `Bearer ${adminToken}` }
        }
      );
      
      if (response.data.success) {
        const count = response.data.data.length;
        success(`  Found ${count} ${status} tables`);
        passedTests++;
      }
    } catch (err) {
      error(`  Filter failed: ${err.message}`);
    }
  }
  
  log(`\n📊 Filter Tests: ${passedTests}/${statuses.length} passed`, 'blue');
  return passedTests === statuses.length;
}

// Test 9: Delete Table (Cleanup)
async function testDeleteTable() {
  section('TEST 9: DELETE TABLE (CLEANUP)');
  
  if (!testTableId) {
    info('No test table to delete');
    return true;
  }
  
  try {
    info(`Deleting test table: ${testTableId}`);
    const response = await axios.delete(
      `${BASE_URL}/restaurants/${restaurantId}/tables/${testTableId}`,
      {
        headers: { Authorization: `Bearer ${adminToken}` }
      }
    );
    
    if (response.data.success) {
      success('Test table deleted successfully!');
      return true;
    } else {
      error('Delete failed');
      return false;
    }
  } catch (err) {
    error(`Delete table failed: ${err.response?.data?.message || err.message}`);
    return false;
  }
}

// Test 10: Edge Cases
async function testEdgeCases() {
  section('TEST 10: EDGE CASES');
  
  let passedTests = 0;
  const totalTests = 3;
  
  // Test 10.1: Invalid table number
  try {
    info('Testing duplicate table number...');
    await axios.post(
      `${BASE_URL}/restaurants/${restaurantId}/tables`,
      {
        number: 'T001', // Existing number
        capacity: 4
      },
      {
        headers: { Authorization: `Bearer ${adminToken}` }
      }
    );
    error('  Should have rejected duplicate number!');
  } catch (err) {
    if (err.response?.status === 400 || err.response?.status === 409) {
      success('  Duplicate number correctly rejected');
      passedTests++;
    }
  }
  
  // Test 10.2: Invalid capacity
  try {
    info('Testing invalid capacity...');
    await axios.post(
      `${BASE_URL}/restaurants/${restaurantId}/tables`,
      {
        number: 'TEST-INVALID',
        capacity: -1
      },
      {
        headers: { Authorization: `Bearer ${adminToken}` }
      }
    );
    error('  Should have rejected negative capacity!');
  } catch (err) {
    if (err.response?.status === 400) {
      success('  Invalid capacity correctly rejected');
      passedTests++;
    }
  }
  
  // Test 10.3: Non-existent table
  try {
    info('Testing non-existent table...');
    await axios.get(
      `${BASE_URL}/restaurants/${restaurantId}/tables/00000000-0000-0000-0000-000000000000`,
      {
        headers: { Authorization: `Bearer ${adminToken}` }
      }
    );
    error('  Should have returned 404!');
  } catch (err) {
    if (err.response?.status === 404) {
      success('  Non-existent table correctly handled');
      passedTests++;
    }
  }
  
  log(`\n📊 Edge Case Tests: ${passedTests}/${totalTests} passed`, 'blue');
  return passedTests === totalTests;
}

// Main test runner
async function runAllTests() {
  log('\n' + '='.repeat(60), 'blue');
  log('  🧪 TABLE MANAGEMENT TESTING SUITE', 'bold');
  log('  Starting comprehensive table API tests...', 'blue');
  log('='.repeat(60) + '\n', 'blue');
  
  const results = {
    passed: 0,
    failed: 0,
    total: 10
  };
  
  const tests = [
    { name: 'Admin Login', fn: testLogin },
    { name: 'Get Restaurant', fn: testGetRestaurant },
    { name: 'Get All Tables', fn: testGetAllTables },
    { name: 'Get Table By ID', fn: testGetTableById },
    { name: 'Create Table', fn: testCreateTable },
    { name: 'Update Table', fn: testUpdateTable },
    { name: 'Change Status', fn: testChangeTableStatus },
    { name: 'Filter Tables', fn: testFilterTablesByStatus },
    { name: 'Delete Table', fn: testDeleteTable },
    { name: 'Edge Cases', fn: testEdgeCases }
  ];
  
  for (const test of tests) {
    const result = await test.fn();
    if (result) {
      results.passed++;
    } else {
      results.failed++;
    }
    await sleep(500);
  }
  
  // Final summary
  section('TEST SUMMARY');
  log(`\nTotal Tests: ${results.total}`, 'blue');
  log(`Passed: ${results.passed}`, 'green');
  log(`Failed: ${results.failed}`, results.failed > 0 ? 'red' : 'green');
  
  const percentage = ((results.passed / results.total) * 100).toFixed(1);
  log(`\nSuccess Rate: ${percentage}%`, percentage === '100.0' ? 'green' : 'yellow');
  
  if (results.failed === 0) {
    log('\n🎉 ALL TESTS PASSED! 🎉\n', 'green');
  } else {
    log(`\n⚠️  ${results.failed} TEST(S) FAILED\n`, 'red');
  }
  
  log('='.repeat(60) + '\n', 'blue');
}

// Run tests
runAllTests().catch(err => {
  error(`\n💥 Test suite crashed: ${err.message}`);
  console.error(err);
  process.exit(1);
});
