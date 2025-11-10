/**
 * 🧪 COMPREHENSIVE RESERVATION & TABLE TESTING
 * 
 * Tests all reservation endpoints and table availability
 * Run: node test-reservation-complete.js
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

// Test data
let customerToken = '';
let adminToken = '';
let testReservationId = '';

// Helper functions
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

// Test 1: Login
async function testLogin() {
  section('TEST 1: USER AUTHENTICATION');
  
  try {
    // Login as customer
    info('Logging in as customer...');
    const customerResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'customer1@example.com',
      password: 'Test123!'
    });
    
    if (customerResponse.data.success && customerResponse.data.token) {
      customerToken = customerResponse.data.token;
      success(`Customer login successful: ${customerResponse.data.user.email}`);
    } else {
      throw new Error('Customer login failed');
    }
    
    // Login as admin
    info('Logging in as admin...');
    const adminResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@restaurant.com',
      password: 'admin123'
    });
    
    if (adminResponse.data.success && adminResponse.data.token) {
      adminToken = adminResponse.data.token;
      success(`Admin login successful: ${adminResponse.data.user.email}`);
    } else {
      throw new Error('Admin login failed');
    }
    
    return true;
  } catch (err) {
    error(`Login test failed: ${err.response?.data?.message || err.message}`);
    return false;
  }
}

// Test 2: Check Table Availability
async function testCheckAvailability() {
  section('TEST 2: CHECK TABLE AVAILABILITY');
  
  const testCases = [
    { date: '2025-10-10', time: '18:00', party_size: 2, description: '2 guests at 6:00 PM' },
    { date: '2025-10-10', time: '19:00', party_size: 4, description: '4 guests at 7:00 PM' },
    { date: '2025-10-10', time: '20:00', party_size: 6, description: '6 guests at 8:00 PM' },
    { date: '2025-10-11', time: '18:30', party_size: 8, description: '8 guests at 6:30 PM' }
  ];
  
  let passedTests = 0;
  
  for (const testCase of testCases) {
    try {
      info(`Testing: ${testCase.description} on ${testCase.date}`);
      
      const response = await axios.get(`${BASE_URL}/reservations/available-tables`, {
        params: testCase,
        headers: { Authorization: `Bearer ${customerToken}` }
      });
      
      if (response.data.success) {
        success(`  Found ${response.data.count} available tables`);
        if (response.data.tables && response.data.tables.length > 0) {
          info(`  Tables: ${response.data.tables.map(t => t.number).join(', ')}`);
        }
        passedTests++;
      } else {
        error(`  No tables available`);
      }
    } catch (err) {
      error(`  Error: ${err.response?.data?.message || err.message}`);
    }
  }
  
  log(`\n📊 Availability Tests: ${passedTests}/${testCases.length} passed`, 'blue');
  return passedTests === testCases.length;
}

// Test 3: Create Reservation
async function testCreateReservation() {
  section('TEST 3: CREATE RESERVATION');
  
  try {
    // First get available tables
    info('Getting available tables...');
    const availabilityResponse = await axios.get(`${BASE_URL}/reservations/available-tables`, {
      params: {
        date: '2025-10-12',
        time: '19:00',
        party_size: 2
      },
      headers: { Authorization: `Bearer ${customerToken}` }
    });
    
    if (!availabilityResponse.data.success || availabilityResponse.data.tables.length === 0) {
      error('No tables available for testing');
      return false;
    }
    
    const selectedTable = availabilityResponse.data.tables[0];
    success(`Selected table: ${selectedTable.number} (capacity: ${selectedTable.capacity})`);
    
    // Create reservation
    info('Creating reservation...');
    const reservationData = {
      customer_name: 'Test Customer',
      customer_email: 'customer1@example.com',
      customer_phone: '+1234567890',
      party_size: 2,
      reservation_date: '2025-10-12',
      reservation_time: '19:00',
      table_id: selectedTable.id,
      special_requests: 'Window seat preferred'
    };
    
    const response = await axios.post(`${BASE_URL}/reservations`, reservationData, {
      headers: { Authorization: `Bearer ${customerToken}` }
    });
    
    if (response.data.success && response.data.data) {
      testReservationId = response.data.data.id;
      success(`Reservation created successfully!`);
      success(`  ID: ${testReservationId}`);
      success(`  Status: ${response.data.data.status}`);
      success(`  Table: ${selectedTable.number}`);
      return true;
    } else {
      error('Reservation creation failed');
      return false;
    }
  } catch (err) {
    error(`Create reservation failed: ${err.response?.data?.message || err.message}`);
    if (err.response?.data?.errors) {
      console.log('Validation errors:', err.response.data.errors);
    }
    return false;
  }
}

// Test 4: Get My Reservations
async function testGetMyReservations() {
  section('TEST 4: GET MY RESERVATIONS');
  
  try {
    info('Fetching customer reservations...');
    const response = await axios.get(`${BASE_URL}/reservations/my`, {
      headers: { Authorization: `Bearer ${customerToken}` }
    });
    
    if (response.data.success && Array.isArray(response.data.data)) {
      success(`Found ${response.data.data.length} reservations`);
      
      response.data.data.forEach((reservation, index) => {
        info(`\n  Reservation ${index + 1}:`);
        info(`    Date: ${reservation.reservation_date} at ${reservation.reservation_time}`);
        info(`    Party Size: ${reservation.party_size} guests`);
        info(`    Status: ${reservation.status}`);
        if (reservation.table_number) {
          info(`    Table: ${reservation.table_number}`);
        }
      });
      
      return true;
    } else {
      error('Failed to get reservations');
      return false;
    }
  } catch (err) {
    error(`Get reservations failed: ${err.response?.data?.message || err.message}`);
    return false;
  }
}

// Test 5: Get Single Reservation
async function testGetReservationById() {
  section('TEST 5: GET RESERVATION BY ID');
  
  if (!testReservationId) {
    error('No test reservation ID available');
    return false;
  }
  
  try {
    info(`Fetching reservation: ${testReservationId}`);
    const response = await axios.get(`${BASE_URL}/reservations/${testReservationId}`, {
      headers: { Authorization: `Bearer ${customerToken}` }
    });
    
    if (response.data.success && response.data.data) {
      const res = response.data.data;
      success('Reservation details retrieved successfully!');
      info(`  Customer: ${res.customer_name}`);
      info(`  Email: ${res.customer_email}`);
      info(`  Date: ${res.reservation_date} at ${res.reservation_time}`);
      info(`  Party Size: ${res.party_size} guests`);
      info(`  Status: ${res.status}`);
      if (res.special_requests) {
        info(`  Special Requests: ${res.special_requests}`);
      }
      return true;
    } else {
      error('Failed to get reservation');
      return false;
    }
  } catch (err) {
    error(`Get reservation failed: ${err.response?.data?.message || err.message}`);
    return false;
  }
}

// Test 6: Update Reservation
async function testUpdateReservation() {
  section('TEST 6: UPDATE RESERVATION');
  
  if (!testReservationId) {
    error('No test reservation ID available');
    return false;
  }
  
  try {
    info('Updating reservation...');
    const updateData = {
      party_size: 3,
      special_requests: 'Window seat required - Updated request'
    };
    
    const response = await axios.put(`${BASE_URL}/reservations/${testReservationId}`, updateData, {
      headers: { Authorization: `Bearer ${customerToken}` }
    });
    
    if (response.data.success) {
      success('Reservation updated successfully!');
      success(`  New party size: ${response.data.data.party_size}`);
      return true;
    } else {
      error('Update failed');
      return false;
    }
  } catch (err) {
    error(`Update reservation failed: ${err.response?.data?.message || err.message}`);
    return false;
  }
}

// Test 7: Get All Reservations (Admin)
async function testGetAllReservations() {
  section('TEST 7: GET ALL RESERVATIONS (ADMIN)');
  
  try {
    info('Fetching all reservations as admin...');
    const response = await axios.get(`${BASE_URL}/reservations`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    if (response.data.success && Array.isArray(response.data.data)) {
      success(`Found ${response.data.data.length} total reservations`);
      
      // Count by status
      const statusCounts = response.data.data.reduce((acc, res) => {
        acc[res.status] = (acc[res.status] || 0) + 1;
        return acc;
      }, {});
      
      info('\n  Status breakdown:');
      Object.entries(statusCounts).forEach(([status, count]) => {
        info(`    ${status}: ${count}`);
      });
      
      return true;
    } else {
      error('Failed to get all reservations');
      return false;
    }
  } catch (err) {
    error(`Get all reservations failed: ${err.response?.data?.message || err.message}`);
    return false;
  }
}

// Test 8: Cancel Reservation
async function testCancelReservation() {
  section('TEST 8: CANCEL RESERVATION');
  
  if (!testReservationId) {
    error('No test reservation ID available');
    return false;
  }
  
  try {
    info(`Cancelling reservation: ${testReservationId}`);
    const response = await axios.delete(`${BASE_URL}/reservations/${testReservationId}`, {
      headers: { Authorization: `Bearer ${customerToken}` }
    });
    
    if (response.data.success) {
      success('Reservation cancelled successfully!');
      success(`  Status: ${response.data.data.status}`);
      return true;
    } else {
      error('Cancellation failed');
      return false;
    }
  } catch (err) {
    error(`Cancel reservation failed: ${err.response?.data?.message || err.message}`);
    return false;
  }
}

// Test 9: Edge Cases
async function testEdgeCases() {
  section('TEST 9: EDGE CASES & VALIDATION');
  
  let passedTests = 0;
  const totalTests = 4;
  
  // Test 9.1: Past date
  try {
    info('Testing past date rejection...');
    await axios.get(`${BASE_URL}/reservations/available-tables`, {
      params: {
        date: '2020-01-01',
        time: '18:00',
        party_size: 2
      },
      headers: { Authorization: `Bearer ${customerToken}` }
    });
    error('  Should have rejected past date!');
  } catch (err) {
    if (err.response?.status === 400) {
      success('  Past date correctly rejected');
      passedTests++;
    } else {
      error(`  Unexpected error: ${err.message}`);
    }
  }
  
  // Test 9.2: Invalid party size
  try {
    info('Testing invalid party size...');
    await axios.post(`${BASE_URL}/reservations`, {
      customer_name: 'Test',
      customer_email: 'test@test.com',
      party_size: 0,
      reservation_date: '2025-10-15',
      reservation_time: '19:00'
    }, {
      headers: { Authorization: `Bearer ${customerToken}` }
    });
    error('  Should have rejected invalid party size!');
  } catch (err) {
    if (err.response?.status === 400) {
      success('  Invalid party size correctly rejected');
      passedTests++;
    } else {
      error(`  Unexpected error: ${err.message}`);
    }
  }
  
  // Test 9.3: Missing required fields
  try {
    info('Testing missing required fields...');
    await axios.post(`${BASE_URL}/reservations`, {
      customer_name: 'Test'
    }, {
      headers: { Authorization: `Bearer ${customerToken}` }
    });
    error('  Should have rejected missing fields!');
  } catch (err) {
    if (err.response?.status === 400) {
      success('  Missing fields correctly rejected');
      passedTests++;
    } else {
      error(`  Unexpected error: ${err.message}`);
    }
  }
  
  // Test 9.4: Unauthenticated request
  try {
    info('Testing unauthenticated request...');
    await axios.get(`${BASE_URL}/reservations/my`);
    error('  Should have rejected unauthenticated request!');
  } catch (err) {
    if (err.response?.status === 401) {
      success('  Unauthenticated request correctly rejected');
      passedTests++;
    } else {
      error(`  Unexpected error: ${err.message}`);
    }
  }
  
  log(`\n📊 Edge Case Tests: ${passedTests}/${totalTests} passed`, 'blue');
  return passedTests === totalTests;
}

// Main test runner
async function runAllTests() {
  log('\n' + '='.repeat(60), 'blue');
  log('  🧪 RESERVATION & TABLE TESTING SUITE', 'bold');
  log('  Starting comprehensive API tests...', 'blue');
  log('='.repeat(60) + '\n', 'blue');
  
  const results = {
    passed: 0,
    failed: 0,
    total: 9
  };
  
  // Run tests sequentially
  const tests = [
    { name: 'Login', fn: testLogin },
    { name: 'Check Availability', fn: testCheckAvailability },
    { name: 'Create Reservation', fn: testCreateReservation },
    { name: 'Get My Reservations', fn: testGetMyReservations },
    { name: 'Get Reservation By ID', fn: testGetReservationById },
    { name: 'Update Reservation', fn: testUpdateReservation },
    { name: 'Get All Reservations', fn: testGetAllReservations },
    { name: 'Cancel Reservation', fn: testCancelReservation },
    { name: 'Edge Cases', fn: testEdgeCases }
  ];
  
  for (const test of tests) {
    const result = await test.fn();
    if (result) {
      results.passed++;
    } else {
      results.failed++;
    }
    await sleep(500); // Small delay between tests
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
