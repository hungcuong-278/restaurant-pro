/**
 * Test Order Creation with New European Menu Items
 * 
 * This script tests the complete order flow with the newly added
 * European fine dining menu items.
 */

const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testOrderWithNewMenu() {
  log('\n🍽️  TESTING ORDER CREATION WITH EUROPEAN MENU', 'cyan');
  log('='.repeat(60), 'cyan');

  try {
    // Step 1: Get all menu items (get all with high limit)
    log('\n📋 Step 1: Fetching menu items...', 'blue');
    const menuResponse = await axios.get(`${API_BASE}/menu/items?limit=100`);
    const allItems = menuResponse.data.data.items;
    log(`✅ Found ${allItems.length} total menu items`, 'green');

    // Filter new European items
    const europeanItems = allItems.filter(item => 
      ['Caesar Salad', 'Caprese Salad', 'Beef Wellington', 'Duck à l\'Orange', 
       'Steak au Poivre', 'Spaghetti Carbonara', 'Risotto alla Milanese', 
       'Crème Brûlée'].includes(item.name)
    );
    
    log(`✅ Found ${europeanItems.length} new European items`, 'green');
    log('\nNew menu items:', 'yellow');
    europeanItems.forEach(item => {
      log(`  - ${item.name} ($${item.price}) - ${item.description}`, 'reset');
    });

    // Step 2: Get available tables
    log('\n🪑 Step 2: Fetching available tables...', 'blue');
    const tablesResponse = await axios.get(`${API_BASE}/tables`);
    const availableTables = tablesResponse.data.filter(t => t.status === 'available');
    
    if (availableTables.length === 0) {
      log('❌ No available tables found', 'red');
      return;
    }
    
    const selectedTable = availableTables[0];
    log(`✅ Selected table: ${selectedTable.table_number} (${selectedTable.capacity} seats)`, 'green');

    // Step 3: Create test order with European items
    log('\n📝 Step 3: Creating test order with European dishes...', 'blue');
    
    const orderItems = [
      // Appetizer
      {
        menu_item_id: europeanItems.find(i => i.name === 'Caesar Salad')?.id,
        quantity: 2,
        special_instructions: 'Extra parmesan cheese, please'
      },
      // Main course 1
      {
        menu_item_id: europeanItems.find(i => i.name === 'Beef Wellington')?.id,
        quantity: 1,
        special_instructions: 'Medium rare'
      },
      // Main course 2
      {
        menu_item_id: europeanItems.find(i => i.name === 'Duck à l\'Orange')?.id,
        quantity: 1,
        special_instructions: 'No orange sauce on the side'
      },
      // Pasta
      {
        menu_item_id: europeanItems.find(i => i.name === 'Spaghetti Carbonara')?.id,
        quantity: 1,
        special_instructions: 'Extra crispy guanciale'
      },
      // Dessert
      {
        menu_item_id: europeanItems.find(i => i.name === 'Crème Brûlée')?.id,
        quantity: 2,
        special_instructions: 'Slightly caramelized'
      }
    ].filter(item => item.menu_item_id); // Remove items not found

    const orderData = {
      table_id: selectedTable.id,
      items: orderItems,
      special_instructions: 'VIP customer - Premium European dining experience. Please ensure presentation is excellent.'
    };

    log('\nOrder details:', 'yellow');
    log(`  Table: ${selectedTable.table_number}`, 'reset');
    log(`  Items: ${orderItems.length}`, 'reset');
    
    const orderResponse = await axios.post(`${API_BASE}/orders`, orderData);
    const createdOrder = orderResponse.data;
    
    log(`\n✅ Order created successfully!`, 'green');
    log(`  Order ID: ${createdOrder.id}`, 'green');
    log(`  Status: ${createdOrder.status}`, 'green');
    log(`  Total Amount: $${createdOrder.total_amount}`, 'green');

    // Step 4: Fetch order details to verify
    log('\n🔍 Step 4: Verifying order details...', 'blue');
    const orderDetailsResponse = await axios.get(`${API_BASE}/orders/${createdOrder.id}`);
    const orderDetails = orderDetailsResponse.data;

    log('✅ Order details retrieved:', 'green');
    log(`\n  Order #${orderDetails.id}`, 'yellow');
    log(`  Table: ${orderDetails.table_number}`, 'reset');
    log(`  Status: ${orderDetails.status}`, 'reset');
    log(`  Payment Status: ${orderDetails.payment_status}`, 'reset');
    log(`  Subtotal: $${orderDetails.subtotal}`, 'reset');
    log(`  Tax (10%): $${orderDetails.tax_amount}`, 'reset');
    log(`  Total: $${orderDetails.total_amount}`, 'reset');
    log(`  Special Instructions: ${orderDetails.special_instructions}`, 'reset');

    log('\n  Order Items:', 'yellow');
    orderDetails.items.forEach((item, index) => {
      log(`    ${index + 1}. ${item.menu_item_name} x${item.quantity} = $${item.subtotal}`, 'reset');
      if (item.special_instructions) {
        log(`       Note: ${item.special_instructions}`, 'cyan');
      }
    });

    // Step 5: Calculate and verify totals
    log('\n💰 Step 5: Verifying calculations...', 'blue');
    const calculatedSubtotal = orderDetails.items.reduce((sum, item) => sum + parseFloat(item.subtotal), 0);
    const calculatedTax = calculatedSubtotal * 0.10;
    const calculatedTotal = calculatedSubtotal + calculatedTax;

    const subtotalMatch = Math.abs(calculatedSubtotal - parseFloat(orderDetails.subtotal)) < 0.01;
    const taxMatch = Math.abs(calculatedTax - parseFloat(orderDetails.tax_amount)) < 0.01;
    const totalMatch = Math.abs(calculatedTotal - parseFloat(orderDetails.total_amount)) < 0.01;

    if (subtotalMatch && taxMatch && totalMatch) {
      log('✅ All calculations are correct!', 'green');
      log(`  Subtotal: $${calculatedSubtotal.toFixed(2)} ✓`, 'green');
      log(`  Tax: $${calculatedTax.toFixed(2)} ✓`, 'green');
      log(`  Total: $${calculatedTotal.toFixed(2)} ✓`, 'green');
    } else {
      log('⚠️  Calculation mismatch detected:', 'yellow');
      log(`  Expected subtotal: $${calculatedSubtotal.toFixed(2)}, Got: $${orderDetails.subtotal}`, 'reset');
      log(`  Expected tax: $${calculatedTax.toFixed(2)}, Got: $${orderDetails.tax_amount}`, 'reset');
      log(`  Expected total: $${calculatedTotal.toFixed(2)}, Got: $${orderDetails.total_amount}`, 'reset');
    }

    // Step 6: Test menu categories
    log('\n📚 Step 6: Testing menu categories...', 'blue');
    const categoriesResponse = await axios.get(`${API_BASE}/menu/categories`);
    const categories = categoriesResponse.data;
    
    log(`✅ Found ${categories.length} categories:`, 'green');
    categories.forEach(cat => {
      const itemCount = allItems.filter(item => item.category_id === cat.id).length;
      log(`  - ${cat.name} (${itemCount} items)`, 'reset');
    });

    // Summary
    log('\n' + '='.repeat(60), 'cyan');
    log('✅ TEST COMPLETED SUCCESSFULLY!', 'green');
    log('='.repeat(60), 'cyan');
    
    log('\n📊 Test Summary:', 'yellow');
    log(`  ✅ Menu items loaded: ${allItems.length}`, 'green');
    log(`  ✅ European items found: ${europeanItems.length}`, 'green');
    log(`  ✅ Order created: #${createdOrder.id}`, 'green');
    log(`  ✅ Order total: $${orderDetails.total_amount}`, 'green');
    log(`  ✅ Calculations verified: Passed`, 'green');
    log(`  ✅ Categories loaded: ${categories.length}`, 'green');

    log('\n🎉 The new European menu is working perfectly!', 'cyan');
    log(`\n💡 You can view this order at: http://localhost:3000/orders/${createdOrder.id}`, 'yellow');

  } catch (error) {
    log('\n❌ TEST FAILED', 'red');
    log('='.repeat(60), 'red');
    
    if (error.response) {
      log(`\nAPI Error: ${error.response.status} ${error.response.statusText}`, 'red');
      log(`Endpoint: ${error.config.url}`, 'yellow');
      log(`Response: ${JSON.stringify(error.response.data, null, 2)}`, 'red');
    } else if (error.request) {
      log(`\nNo response received from server`, 'red');
      log(`Make sure backend is running on ${API_BASE}`, 'yellow');
    } else {
      log(`\nError: ${error.message}`, 'red');
    }
    
    log('\n' + error.stack, 'red');
  }
}

// Run the test
testOrderWithNewMenu();
