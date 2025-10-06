#!/usr/bin/env node

/**
 * RESERVATION SYSTEM - FINAL VERIFICATION TEST
 * 
 * Tests all fixed bugs to ensure reservation system works end-to-end
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// ANSI Colors
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const log = {
  success: (msg) => console.log(`${colors.green}✓ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}✗ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.cyan}ℹ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠ ${msg}${colors.reset}`),
  title: (msg) => console.log(`\n${colors.bright}${colors.blue}━━━ ${msg} ━━━${colors.reset}\n`),
};

let testsPassed = 0;
let testsFailed = 0;
let customerToken = null;
let adminToken = null;

/**
 * Test 1: Admin Login (Bug Fix #1)
 */
async function testAdminLogin() {
  log.title('TEST 1: Admin Login (Password Reset Fix)');
  
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@restaurant.com',
      password: 'admin123'
    });
    
    if (response.data.success && response.data.token) {
      adminToken = response.data.token;
      log.success('Admin login successful');
      log.info(`Token: ${adminToken.substring(0, 30)}...`);
      testsPassed++;
      return true;
    } else {
      throw new Error('No token received');
    }
  } catch (error) {
    log.error(`Admin login failed: ${error.response?.data?.message || error.message}`);
    testsFailed++;
    return false;
  }
}

/**
 * Test 2: Customer Login
 */
async function testCustomerLogin() {
  log.title('TEST 2: Customer Login');
  
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'customer1@example.com',
      password: 'Test123!'
    });
    
    if (response.data.success && response.data.token) {
      customerToken = response.data.token;
      log.success('Customer login successful');
      log.info(`Token: ${customerToken.substring(0, 30)}...`);
      testsPassed++;
      return true;
    } else {
      throw new Error('No token received');
    }
  } catch (error) {
    log.error(`Customer login failed: ${error.response?.data?.message || error.message}`);
    testsFailed++;
    return false;
  }
}

/**
 * Test 3: Check Availability with Auth Token (Bug Fix #6)
 */
async function testCheckAvailabilityWithAuth() {
  log.title('TEST 3: Check Availability WITH Auth Token (Token Key Fix)');
  
  if (!customerToken) {
    log.warning('Skipping: No customer token available');
    return false;
  }
  
  try {
    const response = await axios.get(`${BASE_URL}/reservations/available-tables`, {
      params: {
        date: '2025-10-10',
        time: '18:00',
        party_size: 2
      },
      headers: {
        Authorization: `Bearer ${customerToken}`
      }
    });
    
    if (response.data.success && response.data.tables) {
      const count = response.data.tables.length;
      log.success(`Found ${count} available tables WITH auth token`);
      response.data.tables.forEach(table => {
        log.info(`  - Table ${table.table_number} (${table.capacity} seats) - ${table.location}`);
      });
      testsPassed++;
      return true;
    } else {
      throw new Error('No tables data received');
    }
  } catch (error) {
    log.error(`Check availability failed: ${error.response?.data?.message || error.message}`);
    if (error.response?.status === 401) {
      log.error('🔴 401 UNAUTHORIZED - This means the token key fix did NOT work!');
    }
    testsFailed++;
    return false;
  }
}

/**
 * Test 4: Check Availability WITHOUT Auth Token (Should Fail)
 */
async function testCheckAvailabilityWithoutAuth() {
  log.title('TEST 4: Check Availability WITHOUT Auth Token (Should Return 401)');
  
  try {
    const response = await axios.get(`${BASE_URL}/reservations/available-tables`, {
      params: {
        date: '2025-10-10',
        time: '18:00',
        party_size: 2
      }
      // NO Authorization header
    });
    
    log.error('This should have failed with 401, but it succeeded!');
    log.warning('Security issue: endpoint accessible without authentication');
    testsFailed++;
    return false;
  } catch (error) {
    if (error.response?.status === 401) {
      log.success('Correctly returned 401 Unauthorized without token ✓');
      log.info('Security check passed: endpoint requires authentication');
      testsPassed++;
      return true;
    } else {
      log.error(`Unexpected error: ${error.response?.status} - ${error.message}`);
      testsFailed++;
      return false;
    }
  }
}

/**
 * Test 5: Create Reservation (All Fixes Combined)
 */
async function testCreateReservation() {
  log.title('TEST 5: Create Reservation (Complete Flow)');
  
  if (!customerToken) {
    log.warning('Skipping: No customer token available');
    return false;
  }
  
  try {
    // First get available tables
    const availabilityResponse = await axios.get(`${BASE_URL}/reservations/available-tables`, {
      params: {
        date: '2025-10-12',
        time: '19:00',
        party_size: 2
      },
      headers: {
        Authorization: `Bearer ${customerToken}`
      }
    });
    
    if (!availabilityResponse.data.tables || availabilityResponse.data.tables.length === 0) {
      log.warning('No tables available for Oct 12, 7PM');
      return false;
    }
    
    const selectedTable = availabilityResponse.data.tables[0];
    log.info(`Selected table: ${selectedTable.table_number} (ID: ${selectedTable.id.substring(0, 8)}...)`);
    
    // Create reservation
    const reservationData = {
      customer_name: 'Test Customer',
      customer_email: 'customer1@example.com',
      customer_phone: '0123456789',
      party_size: 2,
      reservation_date: '2025-10-12',
      reservation_time: '19:00',
      table_id: selectedTable.id,
      special_requests: 'Test reservation - please ignore'
    };
    
    const createResponse = await axios.post(
      `${BASE_URL}/reservations`,
      reservationData,
      {
        headers: {
          Authorization: `Bearer ${customerToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (createResponse.data.success) {
      log.success('Reservation created successfully!');
      log.info(`Reservation ID: ${createResponse.data.reservation.id.substring(0, 8)}...`);
      log.info(`Table: ${createResponse.data.reservation.table_number}`);
      log.info(`Date: ${createResponse.data.reservation.reservation_date}`);
      log.info(`Time: ${createResponse.data.reservation.reservation_time}`);
      testsPassed++;
      
      // Clean up - cancel the test reservation
      try {
        await axios.delete(
          `${BASE_URL}/reservations/${createResponse.data.reservation.id}`,
          {
            headers: {
              Authorization: `Bearer ${customerToken}`
            }
          }
        );
        log.info('Test reservation cleaned up ✓');
      } catch (cleanupError) {
        log.warning('Could not clean up test reservation (this is OK)');
      }
      
      return true;
    } else {
      throw new Error('No success response');
    }
  } catch (error) {
    log.error(`Create reservation failed: ${error.response?.data?.message || error.message}`);
    if (error.response?.data) {
      console.log('Error details:', error.response.data);
    }
    testsFailed++;
    return false;
  }
}

/**
 * Test 6: Get My Reservations
 */
async function testGetMyReservations() {
  log.title('TEST 6: Get My Reservations');
  
  if (!customerToken) {
    log.warning('Skipping: No customer token available');
    return false;
  }
  
  try {
    const response = await axios.get(`${BASE_URL}/reservations/my`, {
      headers: {
        Authorization: `Bearer ${customerToken}`
      }
    });
    
    if (response.data.success) {
      const count = response.data.reservations.length;
      log.success(`Retrieved ${count} reservations`);
      
      if (count > 0) {
        response.data.reservations.forEach((res, index) => {
          log.info(`  ${index + 1}. ${res.reservation_date} at ${res.reservation_time} - Table ${res.table_number} (${res.status})`);
        });
      } else {
        log.info('No reservations found (this is OK for a new account)');
      }
      
      testsPassed++;
      return true;
    } else {
      throw new Error('No success response');
    }
  } catch (error) {
    log.error(`Get my reservations failed: ${error.response?.data?.message || error.message}`);
    testsFailed++;
    return false;
  }
}

/**
 * Run all tests
 */
async function runAllTests() {
  console.log('\n' + '='.repeat(70));
  console.log('🧪 RESERVATION SYSTEM - FINAL VERIFICATION TEST SUITE');
  console.log('='.repeat(70));
  
  log.info('Testing all 6 bug fixes...\n');
  
  await testAdminLogin();           // Bug Fix #1: Admin password
  await testCustomerLogin();         // Prerequisite
  await testCheckAvailabilityWithAuth();    // Bug Fix #6: Token key
  await testCheckAvailabilityWithoutAuth(); // Security check
  await testCreateReservation();     // Bug Fixes #2-#5: Route, schema, columns, dates
  await testGetMyReservations();     // Additional verification
  
  // Summary
  console.log('\n' + '='.repeat(70));
  console.log(`${colors.bright}TEST SUMMARY${colors.reset}`);
  console.log('='.repeat(70));
  console.log(`${colors.green}✓ Passed: ${testsPassed}${colors.reset}`);
  console.log(`${colors.red}✗ Failed: ${testsFailed}${colors.reset}`);
  console.log(`${colors.cyan}Total: ${testsPassed + testsFailed}${colors.reset}`);
  
  const successRate = ((testsPassed / (testsPassed + testsFailed)) * 100).toFixed(1);
  console.log(`\nSuccess Rate: ${successRate}%`);
  
  if (testsFailed === 0) {
    console.log(`\n${colors.green}${colors.bright}🎉 ALL TESTS PASSED! Reservation system is fully functional!${colors.reset}\n`);
    process.exit(0);
  } else {
    console.log(`\n${colors.red}${colors.bright}⚠️  ${testsFailed} test(s) failed. Please review the errors above.${colors.reset}\n`);
    process.exit(1);
  }
}

// Run tests
runAllTests().catch(error => {
  log.error(`Fatal error: ${error.message}`);
  console.error(error);
  process.exit(1);
});
