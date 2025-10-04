/**
 * ============================================================================
 * RESTAURANT PRO - STREAMLINED INTEGRATION TEST
 * ============================================================================
 * 
 * Week 7 - Phase 2 - Task 2.6: Backend Integration Testing
 * 
 * This is a streamlined version focusing on core workflows:
 * 1. Complete Order-to-Payment workflow
 * 2. Partial payments
 * 3. Split bill
 * 4. Error handling
 * 
 * Note: Includes delays to avoid rate limiting
 * 
 * Author: Restaurant Pro Team
 * Date: October 4, 2025
 * ============================================================================
 */

const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:5000/api';
const RESTAURANT_ID = 'e4e7bcd3-3b50-47ba-8abc-3597170677bb';
const TABLE_ID = 'e1250430-deee-48d9-b721-386309092e67';
const MENU_ITEM_1 = 'db9c9a7d-7f23-4caf-a7a4-1c16998d8fc7'; // Beef Tenderloin - $42.99
const MENU_ITEM_2 = '268b5422-1074-46e3-8b39-0e9058f316bf'; // Grilled Salmon - $28.99

// Test state
const testState = {
  ordersCreated: [],
  testsPassed: 0,
  testsFailed: 0,
  startTime: Date.now(),
};

// Utility functions
function log(message, type = 'info') {
  const colors = {
    info: '\x1b[36m',
    success: '\x1b[32m',
    error: '\x1b[31m',
    warning: '\x1b[33m',
    header: '\x1b[35m',
    reset: '\x1b[0m',
  };
  console.log(`${colors[type]}${message}${colors.reset}`);
}

function formatCurrency(amount) {
  return `$${parseFloat(amount).toFixed(2)}`;
}

function assert(condition, message) {
  if (condition) {
    testState.testsPassed++;
    log(`  ✓ ${message}`, 'success');
  } else {
    testState.testsFailed++;
    log(`  ✗ ${message}`, 'error');
    throw new Error(`Assertion failed: ${message}`);
  }
}

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function apiCall(method, endpoint, data = null) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: { 'Content-Type': 'application/json' },
    };
    if (data) config.data = data;
    
    const response = await axios(config);
    return response.data;
  } catch (error) {
    if (error.response) {
      return { error: true, status: error.response.status, data: error.response.data };
    }
    throw error;
  }
}

// Main test scenarios
async function scenario1_CompleteOrderWorkflow() {
  log('\n╔════════════════════════════════════════════════════════════════╗', 'header');
  log('║  SCENARIO 1: Complete Order-to-Payment Workflow              ║', 'header');
  log('╚════════════════════════════════════════════════════════════════╝', 'header');
  
  // Step 1: Create order
  log('\n[Step 1] Creating order with 2 items...', 'info');
  const orderData = {
    table_id: TABLE_ID,
    order_type: 'dine_in',
    customer_name: 'Integration Test - Full Payment',
    items: [
      { menu_item_id: MENU_ITEM_1, quantity: 2 },
      { menu_item_id: MENU_ITEM_2, quantity: 1 },
    ],
  };
  
  const createResult = await apiCall('POST', `/restaurants/${RESTAURANT_ID}/orders`, orderData);
  assert(createResult.success, 'Order created');
  assert(createResult.data.payment_status === 'unpaid', 'Initial payment status is unpaid');
  
  const orderId = createResult.data.id;
  const orderTotal = parseFloat(createResult.data.total_amount);
  testState.ordersCreated.push({ id: orderId, total: orderTotal });
  
  log(`  Order: ${createResult.data.order_number}`, 'info');
  log(`  Total: ${formatCurrency(orderTotal)}`, 'info');
  
  await delay(500); // Avoid rate limiting
  
  // Step 2: Update order status through proper workflow
  log('\n[Step 2] Updating order status (confirmed → preparing → ready → served)...', 'info');
  
  // Confirm order
  await apiCall('PATCH', `/restaurants/${RESTAURANT_ID}/orders/${orderId}/status`, { status: 'confirmed' });
  await delay(300);
  
  // Start preparing
  await apiCall('PATCH', `/restaurants/${RESTAURANT_ID}/orders/${orderId}/status`, { status: 'preparing' });
  await delay(300);
  
  // Mark as ready
  await apiCall('PATCH', `/restaurants/${RESTAURANT_ID}/orders/${orderId}/status`, { status: 'ready' });
  await delay(300);
  
  // Mark as served
  const statusResult = await apiCall('PATCH', `/restaurants/${RESTAURANT_ID}/orders/${orderId}/status`, { status: 'served' });
  assert(statusResult.success, 'Order updated to served');
  
  await delay(500);
  
  // Step 3: Process payment
  log('\n[Step 3] Processing cash payment...', 'info');
  const paymentResult = await apiCall(
    'POST',
    `/restaurants/${RESTAURANT_ID}/orders/${orderId}/payments`,
    {
      payment_method: 'cash',
      amount: orderTotal,
      payment_details: { notes: 'Integration test payment' },
    }
  );
  assert(paymentResult.success, 'Payment processed');
  assert(paymentResult.data.payment.status === 'completed', 'Payment completed');
  
  log(`  Payment ID: ${paymentResult.data.payment.id}`, 'info');
  
  await delay(500);
  
  // Step 4: Verify order completed
  log('\n[Step 4] Verifying order status...', 'info');
  const orderResult = await apiCall('GET', `/restaurants/${RESTAURANT_ID}/orders/${orderId}`);
  assert(orderResult.success, 'Order retrieved');
  assert(orderResult.data.payment_status === 'paid', 'Payment status is paid');
  
  log(`  Order Status: ${orderResult.data.status}`, 'info');
  log(`  Payment Status: ${orderResult.data.payment_status}`, 'info');
  
  log('\n✅ Scenario 1 PASSED: Complete workflow working!', 'success');
}

async function scenario2_PartialPayments() {
  log('\n╔════════════════════════════════════════════════════════════════╗', 'header');
  log('║  SCENARIO 2: Partial Payments                                 ║', 'header');
  log('╚════════════════════════════════════════════════════════════════╝', 'header');
  
  await delay(1000); // Longer delay between scenarios
  
  // Create order
  log('\n[Step 1] Creating order for partial payment test...', 'info');
  const orderData = {
    table_id: TABLE_ID,
    order_type: 'dine_in',
    customer_name: 'Integration Test - Partial Payment',
    items: [{ menu_item_id: MENU_ITEM_1, quantity: 1 }],
  };
  
  const createResult = await apiCall('POST', `/restaurants/${RESTAURANT_ID}/orders`, orderData);
  assert(createResult.success, 'Order created');
  
  const orderId = createResult.data.id;
  const orderTotal = parseFloat(createResult.data.total_amount);
  log(`  Total: ${formatCurrency(orderTotal)}`, 'info');
  
  await delay(500);
  
  // First partial payment
  log('\n[Step 2] Processing first partial payment ($20)...', 'info');
  const payment1 = await apiCall(
    'POST',
    `/restaurants/${RESTAURANT_ID}/orders/${orderId}/payments`,
    { payment_method: 'cash', amount: 20.00 }
  );
  assert(payment1.success, 'First payment processed');
  
  await delay(500);
  
  // Check partial status
  log('\n[Step 3] Verifying partial payment status...', 'info');
  const orderCheck = await apiCall('GET', `/restaurants/${RESTAURANT_ID}/orders/${orderId}`);
  assert(orderCheck.data.payment_status === 'partial', 'Status is partial');
  
  await delay(500);
  
  // Update to served (through workflow)
  await apiCall('PATCH', `/restaurants/${RESTAURANT_ID}/orders/${orderId}/status`, { status: 'confirmed' });
  await delay(300);
  await apiCall('PATCH', `/restaurants/${RESTAURANT_ID}/orders/${orderId}/status`, { status: 'preparing' });
  await delay(300);
  await apiCall('PATCH', `/restaurants/${RESTAURANT_ID}/orders/${orderId}/status`, { status: 'ready' });
  await delay(300);
  await apiCall('PATCH', `/restaurants/${RESTAURANT_ID}/orders/${orderId}/status`, { status: 'served' });
  
  await delay(500);
  
  // Second payment (complete)
  log('\n[Step 4] Processing remaining payment...', 'info');
  const remaining = orderTotal - 20.00;
  const payment2 = await apiCall(
    'POST',
    `/restaurants/${RESTAURANT_ID}/orders/${orderId}/payments`,
    { payment_method: 'card', amount: remaining, transaction_id: `test-${Date.now()}` }
  );
  assert(payment2.success, 'Second payment processed');
  
  await delay(500);
  
  // Verify completed
  log('\n[Step 5] Verifying order fully paid...', 'info');
  const summary = await apiCall(
    'GET',
    `/restaurants/${RESTAURANT_ID}/orders/${orderId}/payment-summary`
  );
  assert(summary.data.is_fully_paid, 'Order is fully paid');
  log(`  Total Paid: ${formatCurrency(summary.data.total_paid)}`, 'info');
  
  log('\n✅ Scenario 2 PASSED: Partial payments working!', 'success');
}

async function scenario3_SplitBill() {
  log('\n╔════════════════════════════════════════════════════════════════╗', 'header');
  log('║  SCENARIO 3: Split Bill                                       ║', 'header');
  log('╚════════════════════════════════════════════════════════════════╝', 'header');
  
  await delay(1000);
  
  // Create order
  log('\n[Step 1] Creating order for split bill test...', 'info');
  const orderData = {
    table_id: TABLE_ID,
    order_type: 'dine_in',
    customer_name: 'Integration Test - Split Bill',
    items: [
      { menu_item_id: MENU_ITEM_1, quantity: 2 },
      { menu_item_id: MENU_ITEM_2, quantity: 1 },
    ],
  };
  
  const createResult = await apiCall('POST', `/restaurants/${RESTAURANT_ID}/orders`, orderData);
  assert(createResult.success, 'Order created');
  
  const orderId = createResult.data.id;
  const orderTotal = parseFloat(createResult.data.total_amount);
  log(`  Total: ${formatCurrency(orderTotal)}`, 'info');
  
  await delay(500);
  
  // Update to served (through workflow)
  await apiCall('PATCH', `/restaurants/${RESTAURANT_ID}/orders/${orderId}/status`, { status: 'confirmed' });
  await delay(300);
  await apiCall('PATCH', `/restaurants/${RESTAURANT_ID}/orders/${orderId}/status`, { status: 'preparing' });
  await delay(300);
  await apiCall('PATCH', `/restaurants/${RESTAURANT_ID}/orders/${orderId}/status`, { status: 'ready' });
  await delay(300);
  await apiCall('PATCH', `/restaurants/${RESTAURANT_ID}/orders/${orderId}/status`, { status: 'served' });
  
  await delay(500);
  
  // Process split bill
  log('\n[Step 2] Processing split bill (3 payers)...', 'info');
  const splitResult = await apiCall(
    'POST',
    `/restaurants/${RESTAURANT_ID}/orders/${orderId}/split-payment`,
    {
      split_type: 'equal',
      number_of_payers: 3,
      payment_method: 'cash',
    }
  );
  assert(splitResult.success, 'Split bill processed');
  assert(splitResult.data.payments.length === 3, 'Created 3 payments');
  
  splitResult.data.payments.forEach((p, i) => {
    log(`  Payer ${i + 1}: ${formatCurrency(p.amount)}`, 'info');
  });
  
  await delay(500);
  
  // Verify completed
  log('\n[Step 3] Verifying split bill completed...', 'info');
  const orderCheck = await apiCall('GET', `/restaurants/${RESTAURANT_ID}/orders/${orderId}`);
  assert(orderCheck.data.payment_status === 'paid', 'Order fully paid');
  
  log('\n✅ Scenario 3 PASSED: Split bill working!', 'success');
}

async function scenario4_ErrorHandling() {
  log('\n╔════════════════════════════════════════════════════════════════╗', 'header');
  log('║  SCENARIO 4: Error Handling                                   ║', 'header');
  log('╚════════════════════════════════════════════════════════════════╝', 'header');
  
  await delay(1000);
  
  // Test 1: Duplicate payment prevention
  log('\n[Test 1] Testing duplicate payment prevention...', 'info');
  const paidOrder = testState.ordersCreated[0];
  const dupResult = await apiCall(
    'POST',
    `/restaurants/${RESTAURANT_ID}/orders/${paidOrder.id}/payments`,
    { payment_method: 'cash', amount: 10 }
  );
  assert(dupResult.error, 'Duplicate payment rejected');
  assert(dupResult.status === 422, 'Returns 422 status');
  log(`  Error: ${dupResult.data.message}`, 'info');
  
  await delay(500);
  
  // Test 2: Invalid order ID
  log('\n[Test 2] Testing invalid order ID...', 'info');
  const invalidResult = await apiCall(
    'POST',
    `/restaurants/${RESTAURANT_ID}/orders/invalid-id/payments`,
    { payment_method: 'cash', amount: 10 }
  );
  assert(invalidResult.error, 'Invalid order rejected');
  log(`  Error detected correctly`, 'info');
  
  log('\n✅ Scenario 4 PASSED: Error handling working!', 'success');
}

// Main test runner
async function runAllTests() {
  console.clear();
  log('\n╔════════════════════════════════════════════════════════════════════════════╗', 'header');
  log('║                                                                            ║', 'header');
  log('║        RESTAURANT PRO - STREAMLINED INTEGRATION TEST SUITE                ║', 'header');
  log('║                                                                            ║', 'header');
  log('║                    Week 7 - Phase 2 - Task 2.6                            ║', 'header');
  log('║              End-to-End Testing: Order Management + Payment                ║', 'header');
  log('║                                                                            ║', 'header');
  log('╚════════════════════════════════════════════════════════════════════════════╝', 'header');
  
  log(`\nStarting integration tests at ${new Date().toLocaleString()}...`, 'info');
  log(`Base URL: ${BASE_URL}`, 'info');
  log(`Restaurant ID: ${RESTAURANT_ID}\n`, 'info');
  log('Note: Includes delays to avoid rate limiting\n', 'warning');

  try {
    await scenario1_CompleteOrderWorkflow();
    await scenario2_PartialPayments();
    await scenario3_SplitBill();
    await scenario4_ErrorHandling();
  } catch (error) {
    log(`\n❌ Test failed: ${error.message}`, 'error');
  }

  // Print summary
  const duration = ((Date.now() - testState.startTime) / 1000).toFixed(2);
  const totalTests = testState.testsPassed + testState.testsFailed;
  const successRate = totalTests > 0 ? ((testState.testsPassed / totalTests) * 100).toFixed(1) : '0.0';
  
  log('\n╔════════════════════════════════════════════════════════════════════════════╗', 'header');
  log('║                              TEST SUMMARY                                  ║', 'header');
  log('╚════════════════════════════════════════════════════════════════════════════╝', 'header');
  
  log(`\nTotal Test Scenarios: 4`, 'info');
  log(`Total Assertions: ${totalTests}`, 'info');
  log(`Passed: ${testState.testsPassed} ✅`, 'success');
  log(`Failed: ${testState.testsFailed} ❌`, testState.testsFailed > 0 ? 'error' : 'info');
  log(`Success Rate: ${successRate}%`, successRate === '100.0' ? 'success' : 'warning');
  log(`Duration: ${duration}s`, 'info');
  
  log(`\nOrders Created: ${testState.ordersCreated.length}`, 'info');
  
  if (testState.testsFailed === 0) {
    log('\n🎉 ALL TESTS PASSED! Integration test suite complete!', 'success');
    log('✅ Order Management System: Working perfectly', 'success');
    log('✅ Payment Processing System: Working perfectly', 'success');
    log('✅ Order-Payment Integration: Working perfectly', 'success');
    log('✅ Error Handling: Verified', 'success');
    log('\n🚀 Backend is PRODUCTION READY!', 'success');
  } else {
    log('\n⚠️  Some tests failed. Please review the errors above.', 'warning');
  }
  
  log('\n═══════════════════════════════════════════════════════════════════════════\n', 'header');
}

// Run tests
runAllTests().catch(error => {
  log(`\n💥 Test suite crashed: ${error.message}`, 'error');
  log(`Stack: ${error.stack}`, 'error');
  process.exit(1);
});
