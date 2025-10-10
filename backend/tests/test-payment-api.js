/**
 * Payment Service Test Script
 * Week 7 - Phase 2 - Task 2.1
 * 
 * Tests payment processing functionality
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';
const RESTAURANT_ID = 'e4e7bcd3-3b50-47ba-8abc-3597170677bb';

// Test data
let testOrderId = null;
let testPaymentId = null;

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(testName) {
  console.log(`\n${colors.blue}▶ ${testName}${colors.reset}`);
}

function logSuccess(message) {
  log(`  ✓ ${message}`, 'green');
}

function logError(message) {
  log(`  ✗ ${message}`, 'red');
}

function logInfo(message) {
  log(`  ℹ ${message}`, 'yellow');
}

async function test1_CreateTestOrder() {
  logTest('Test 1: Create Test Order for Payment Testing');
  
  try {
    const orderData = {
      table_id: 'e1250430-deee-48d9-b721-386309092e67', // P001
      order_type: 'dine_in',
      customer_name: 'Payment Test Customer',
      items: [
        {
          menu_item_id: 'db9c9a7d-7f23-4caf-a7a4-1c16998d8fc7', // Beef Tenderloin $42.99
          quantity: 2,
          special_instructions: 'For payment testing'
        },
        {
          menu_item_id: '268b5422-1074-46e3-8b39-0e9058f316bf', // Grilled Salmon $28.99
          quantity: 1
        }
      ]
    };

    const response = await axios.post(
      `${BASE_URL}/restaurants/${RESTAURANT_ID}/orders`,
      orderData
    );

    if (response.status === 201 && response.data.success) {
      testOrderId = response.data.data.id;
      const orderNumber = response.data.data.order_number;
      const total = response.data.data.total_amount;
      
      logSuccess(`Order created: ${orderNumber}`);
      logInfo(`Order ID: ${testOrderId}`);
      logInfo(`Total: $${total}`);
      logInfo(`Items: 2x Beef Tenderloin + 1x Salmon = $114.97`);
      return true;
    }

    logError('Failed to create test order');
    return false;

  } catch (error) {
    logError(`Error: ${error.response?.data?.message || error.message}`);
    if (error.response?.data?.error) {
      logError(`Details: ${error.response.data.error}`);
    }
    return false;
  }
}

async function test2_ProcessCashPayment() {
  logTest('Test 2: Process Cash Payment (Full Amount)');
  
  if (!testOrderId) {
    logError('No test order available');
    return false;
  }

  try {
    const paymentData = {
      payment_method: 'cash',
      amount: 114.97,
      payment_details: {
        cash: {
          amount_received: 120.00,
          change_given: 5.03
        },
        notes: 'Cash payment - full amount'
      }
    };

    const response = await axios.post(
      `${BASE_URL}/restaurants/${RESTAURANT_ID}/orders/${testOrderId}/payments`,
      paymentData
    );

    if (response.status === 201 && response.data.success) {
      testPaymentId = response.data.data.payment.id;
      const payment = response.data.data.payment;
      const orderUpdated = response.data.data.order_updated;
      
      logSuccess(`Payment processed successfully`);
      logInfo(`Payment ID: ${testPaymentId}`);
      logInfo(`Amount: $${payment.amount}`);
      logInfo(`Method: ${payment.payment_method}`);
      logInfo(`Status: ${payment.status}`);
      logInfo(`Order updated: ${orderUpdated ? 'YES' : 'NO'}`);
      return true;
    }

    logError('Failed to process payment');
    return false;

  } catch (error) {
    logError(`Error: ${error.response?.data?.message || error.message}`);
    if (error.response?.data?.details) {
      logError(`Details: ${JSON.stringify(error.response.data.details)}`);
    }
    return false;
  }
}

async function test3_GetPaymentSummary() {
  logTest('Test 3: Get Payment Summary');
  
  if (!testOrderId) {
    logError('No test order available');
    return false;
  }

  try {
    const response = await axios.get(
      `${BASE_URL}/restaurants/${RESTAURANT_ID}/orders/${testOrderId}/payment-summary`
    );

    if (response.status === 200 && response.data.success) {
      const summary = response.data.data;
      
      logSuccess('Payment summary retrieved');
      logInfo(`Order Total: $${summary.order_total}`);
      logInfo(`Total Paid: $${summary.total_paid}`);
      logInfo(`Remaining: $${summary.remaining_amount}`);
      logInfo(`Fully Paid: ${summary.is_fully_paid ? 'YES' : 'NO'}`);
      logInfo(`Number of Payments: ${summary.payments.length}`);
      
      // Verify full payment
      if (summary.is_fully_paid && summary.remaining_amount === 0) {
        logSuccess('✓ Order is fully paid');
      }
      
      return true;
    }

    logError('Failed to get payment summary');
    return false;

  } catch (error) {
    logError(`Error: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

async function test4_CreateOrderForPartialPayment() {
  logTest('Test 4: Create Order for Partial Payment Testing');
  
  try {
    const orderData = {
      table_id: 'e1250430-deee-48d9-b721-386309092e67',
      order_type: 'dine_in',
      customer_name: 'Partial Payment Test',
      items: [
        {
          menu_item_id: 'db9c9a7d-7f23-4caf-a7a4-1c16998d8fc7', // $42.99
          quantity: 1
        }
      ]
    };

    const response = await axios.post(
      `${BASE_URL}/restaurants/${RESTAURANT_ID}/orders`,
      orderData
    );

    if (response.status === 201) {
      const orderId = response.data.data.id;
      const total = response.data.data.total_amount;
      
      logSuccess(`Test order created for partial payment`);
      logInfo(`Order ID: ${orderId}`);
      logInfo(`Total: $${total}`);
      
      // Store for next test
      global.partialPaymentOrderId = orderId;
      return true;
    }

    return false;

  } catch (error) {
    logError(`Error: ${error.message}`);
    return false;
  }
}

async function test5_ProcessPartialPayments() {
  logTest('Test 5: Process Multiple Partial Payments');
  
  const orderId = global.partialPaymentOrderId;
  if (!orderId) {
    logError('No test order for partial payment');
    return false;
  }

  try {
    // First partial payment - $20
    logInfo('Processing first partial payment ($20)...');
    const payment1 = await axios.post(
      `${BASE_URL}/restaurants/${RESTAURANT_ID}/orders/${orderId}/payments`,
      {
        payment_method: 'cash',
        amount: 20.00,
        payment_details: { notes: 'First partial payment' }
      }
    );

    if (payment1.data.success) {
      logSuccess('First payment: $20.00');
      logInfo(`Order status: ${payment1.data.data.order_updated ? 'PARTIAL' : 'UNPAID'}`);
    }

    // Second partial payment - $25.60 (complete the order)
    logInfo('Processing second partial payment ($26.60 to complete)...');
    const payment2 = await axios.post(
      `${BASE_URL}/restaurants/${RESTAURANT_ID}/orders/${orderId}/payments`,
      {
        payment_method: 'card',
        amount: 26.60,
        transaction_id: 'CARD-TEST-' + Date.now(),
        payment_details: {
          card: {
            last4: '4242',
            brand: 'visa'
          },
          notes: 'Second partial payment - completing order'
        }
      }
    );

    if (payment2.data.success) {
      logSuccess('Second payment: $26.60');
      logInfo(`Order fully paid: ${payment2.data.data.order_updated ? 'YES' : 'NO'}`);
    }

    // Get final summary
    const summary = await axios.get(
      `${BASE_URL}/restaurants/${RESTAURANT_ID}/orders/${orderId}/payment-summary`
    );

    if (summary.data.success) {
      const data = summary.data.data;
      logSuccess('Final Payment Summary:');
      logInfo(`  Total: $${data.order_total}`);
      logInfo(`  Paid: $${data.total_paid}`);
      logInfo(`  Remaining: $${data.remaining_amount}`);
      logInfo(`  Payments: ${data.payments.length}`);
      logInfo(`  Fully Paid: ${data.is_fully_paid ? 'YES ✓' : 'NO'}`);
    }

    return true;

  } catch (error) {
    logError(`Error: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

async function test6_CreateOrderForSplitBill() {
  logTest('Test 6: Create Order for Split Bill Testing');
  
  try {
    const orderData = {
      table_id: 'e1250430-deee-48d9-b721-386309092e67',
      order_type: 'dine_in',
      customer_name: 'Split Bill Test',
      items: [
        {
          menu_item_id: 'db9c9a7d-7f23-4caf-a7a4-1c16998d8fc7', // $42.99
          quantity: 2
        }
      ]
    };

    const response = await axios.post(
      `${BASE_URL}/restaurants/${RESTAURANT_ID}/orders`,
      orderData
    );

    if (response.status === 201) {
      const orderId = response.data.data.id;
      const total = response.data.data.total_amount;
      
      logSuccess(`Order created for split bill`);
      logInfo(`Order ID: ${orderId}`);
      logInfo(`Total: $${total} (will be split 2 ways)`);
      
      global.splitBillOrderId = orderId;
      global.splitBillTotal = total;
      return true;
    }

    return false;

  } catch (error) {
    logError(`Error: ${error.message}`);
    return false;
  }
}

async function test7_ProcessSplitBillEqual() {
  logTest('Test 7: Process Split Bill (Equal Split - 2 Payers)');
  
  const orderId = global.splitBillOrderId;
  const total = global.splitBillTotal;
  
  if (!orderId) {
    logError('No test order for split bill');
    return false;
  }

  try {
    const splitData = {
      split_type: 'equal',
      number_of_payers: 2,
      payment_method: 'cash'
    };

    const response = await axios.post(
      `${BASE_URL}/restaurants/${RESTAURANT_ID}/orders/${orderId}/split-payment`,
      splitData
    );

    if (response.status === 201 && response.data.success) {
      const result = response.data.data;
      
      logSuccess(`Split bill processed successfully`);
      logInfo(`Total Amount: $${total}`);
      logInfo(`Split Type: Equal (2 payers)`);
      logInfo(`Amount per payer: $${(total / 2).toFixed(2)}`);
      logInfo(`Payments created: ${result.payments.length}`);
      logInfo(`Order updated: ${result.order_updated ? 'YES (PAID)' : 'NO'}`);
      
      result.payments.forEach((payment, index) => {
        logInfo(`  Payment ${index + 1}: $${payment.amount} - ${payment.status}`);
      });
      
      return true;
    }

    logError('Failed to process split bill');
    return false;

  } catch (error) {
    logError(`Error: ${error.response?.data?.message || error.message}`);
    if (error.response?.data?.details) {
      logError(`Details: ${JSON.stringify(error.response.data.details)}`);
    }
    return false;
  }
}

async function test8_ValidatePaymentAmount() {
  logTest('Test 8: Validate Payment Amount (Should Fail for Overpayment)');
  
  try {
    // Create new order
    const orderResponse = await axios.post(
      `${BASE_URL}/restaurants/${RESTAURANT_ID}/orders`,
      {
        table_id: 'e1250430-deee-48d9-b721-386309092e67',
        order_type: 'dine_in',
        items: [{ menu_item_id: 'db9c9a7d-7f23-4caf-a7a4-1c16998d8fc7', quantity: 1 }]
      }
    );

    const orderId = orderResponse.data.data.id;
    const orderTotal = orderResponse.data.data.total_amount;
    
    logInfo(`Order created with total: $${orderTotal}`);
    
    // Try to pay full amount
    await axios.post(
      `${BASE_URL}/restaurants/${RESTAURANT_ID}/orders/${orderId}/payments`,
      {
        payment_method: 'cash',
        amount: orderTotal
      }
    );
    
    logSuccess('First payment successful');
    
    // Try to pay again (should fail - order already paid)
    try {
      await axios.post(
        `${BASE_URL}/restaurants/${RESTAURANT_ID}/orders/${orderId}/payments`,
        {
          payment_method: 'cash',
          amount: 10.00
        }
      );
      
      logError('Expected error but payment succeeded');
      return false;
      
    } catch (error) {
      if (error.response?.status === 422) {
        logSuccess('✓ Validation correctly prevented duplicate payment');
        logInfo(`Error: ${error.response.data.message}`);
        return true;
      }
      
      logError(`Unexpected error: ${error.message}`);
      return false;
    }

  } catch (error) {
    logError(`Test setup error: ${error.message}`);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  log('\n╔════════════════════════════════════════════════════════╗', 'blue');
  log('║     PAYMENT SERVICE API - COMPREHENSIVE TEST SUITE    ║', 'blue');
  log('╚════════════════════════════════════════════════════════╝', 'blue');

  const tests = [
    test1_CreateTestOrder,
    test2_ProcessCashPayment,
    test3_GetPaymentSummary,
    test4_CreateOrderForPartialPayment,
    test5_ProcessPartialPayments,
    test6_CreateOrderForSplitBill,
    test7_ProcessSplitBillEqual,
    test8_ValidatePaymentAmount
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      const result = await test();
      if (result) {
        passed++;
      } else {
        failed++;
      }
    } catch (error) {
      logError(`Unexpected error in ${test.name}: ${error.message}`);
      failed++;
    }
    
    // Wait a bit between tests
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Summary
  log('\n╔════════════════════════════════════════════════════════╗', 'blue');
  log('║                     TEST SUMMARY                       ║', 'blue');
  log('╚════════════════════════════════════════════════════════╝', 'blue');
  log(`Total Tests: ${tests.length}`, 'yellow');
  log(`Passed: ${passed}`, 'green');
  log(`Failed: ${failed}`, 'red');
  log(`Success Rate: ${((passed / tests.length) * 100).toFixed(1)}%`, 'yellow');

  if (failed === 0) {
    log('\n🎉 All tests passed! Payment Service is working correctly!', 'green');
  } else {
    log(`\n⚠️  ${failed} test(s) failed. Please check the errors above.`, 'red');
  }

  log('\nTest Order ID: ' + (testOrderId || 'N/A'), 'yellow');
  log('Test Payment ID: ' + (testPaymentId || 'N/A'), 'yellow');
}

// Check if server is running
async function checkServer() {
  try {
    await axios.get(`${BASE_URL}/health`);
    return true;
  } catch (error) {
    log('❌ Server is not running at ' + BASE_URL, 'red');
    log('Please start the backend server first: npm run dev', 'yellow');
    return false;
  }
}

// Main execution
(async () => {
  const serverRunning = await checkServer();
  if (serverRunning) {
    await runAllTests();
  }
  process.exit(0);
})();
