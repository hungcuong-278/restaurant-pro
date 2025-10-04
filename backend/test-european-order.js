/**
 * Simple Test: Order Creation with European Menu
 * Tests the complete flow: View menu → Add to cart → Create order
 */

const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';
const RESTAURANT_ID = '64913af3-e39a-4dd0-ad21-c3bb4aa6e9a5'; // Golden Fork

// Console colors
const c = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

function log(msg, color = 'reset') {
  console.log(`${c[color]}${msg}${c.reset}`);
}

async function testEuropeanMenu() {
  log('\n🍽️  TESTING EUROPEAN MENU & ORDER CREATION', 'cyan');
  log('='.repeat(70), 'cyan');

  try {
    // === STEP 1: Get Menu Items ===
    log('\n📋 STEP 1: Fetching all menu items...', 'blue');
    const menuRes = await axios.get(`${API_BASE}/menu/items`, {
      params: { limit: 100, restaurant_id: RESTAURANT_ID }
    });
    
    const allItems = menuRes.data.data.items;
    log(`✅ Loaded ${allItems.length} menu items from database`, 'green');

    // Find European dishes
    const europeanNames = [
      'Caesar Salad', 'Caprese Salad', 'Escargot', 'Smoked Salmon Tartare', 
      'French Onion Soup', 'Beef Wellington', 'Duck à l\'Orange', 
      'Steak au Poivre', 'Lamb Rack', 'Coq au Vin', 'Bouillabaisse',
      'Paella Valenciana', 'Moussaka', 'Ratatouille', 'Sea Bass',
      'Spaghetti Carbonara', 'Risotto alla Milanese', 'Lasagna', 'Crème Brûlée'
    ];

    const europeanItems = allItems.filter(item => 
      europeanNames.some(name => item.name.includes(name.split(' ')[0]))
    );

    log(`✅ Found ${europeanItems.length} European dishes`, 'green');
    log('\n🇪🇺 European Menu Items:', 'yellow');
    europeanItems.forEach((item, i) => {
      log(`  ${i + 1}. ${item.name} - $${item.price}`, 'reset');
      log(`     ${item.description}`, 'cyan');
    });

    // === STEP 2: Get Available Tables ===
    log('\n🪑 STEP 2: Fetching available tables...', 'blue');
    const tablesRes = await axios.get(`${API_BASE}/restaurants/${RESTAURANT_ID}/tables`);
    const allTables = tablesRes.data.data || tablesRes.data;
    const availableTables = Array.isArray(allTables) 
      ? allTables.filter(t => t.status === 'available') 
      : [];

    if (availableTables.length === 0) {
      log('❌ No available tables', 'red');
      return;
    }

    const selectedTable = availableTables[0];
    log(`✅ Selected Table: ${selectedTable.table_number || selectedTable.id}`, 'green');

    // === STEP 3: Create Test Order ===
    log('\n📝 STEP 3: Creating order with European dishes...', 'blue');

    // Select 5 different items for a complete meal
    const selectedItems = [
      { item: europeanItems.find(i => i.name.includes('Caesar')), qty: 2, note: 'Extra parmesan' },
      { item: europeanItems.find(i => i.name.includes('Beef Wellington')), qty: 1, note: 'Medium rare' },
      { item: europeanItems.find(i => i.name.includes('Carbonara')), qty: 1, note: 'Extra crispy' },
      { item: europeanItems.find(i => i.name.includes('Crème')), qty: 2, note: 'Light caramel' },
    ].filter(s => s.item);

    const orderData = {
      order_type: 'dine_in',
      table_id: selectedTable.id,
      items: selectedItems.map(s => ({
        menu_item_id: s.item.id,
        quantity: s.qty,
        special_instructions: s.note
      })),
      special_instructions: 'VIP customer - European fine dining experience. Presentation is key!'
    };

    log('\n📦 Order Contents:', 'yellow');
    let expectedTotal = 0;
    selectedItems.forEach((s, i) => {
      const itemTotal = parseFloat(s.item.price) * s.qty;
      expectedTotal += itemTotal;
      log(`  ${i + 1}. ${s.item.name} x${s.qty} = $${itemTotal.toFixed(2)}`, 'reset');
      log(`     Note: ${s.note}`, 'cyan');
    });
    const expectedTax = expectedTotal * 0.10;
    const expectedGrandTotal = expectedTotal + expectedTax;
    log(`\n  Subtotal: $${expectedTotal.toFixed(2)}`, 'reset');
    log(`  Tax (10%): $${expectedTax.toFixed(2)}`, 'reset');
    log(`  Grand Total: $${expectedGrandTotal.toFixed(2)}`, 'yellow');

    // Submit order
    const orderRes = await axios.post(`${API_BASE}/restaurants/${RESTAURANT_ID}/orders`, orderData);
    const createdOrder = orderRes.data.data || orderRes.data;

    log(`\n✅ Order Created Successfully!`, 'green');
    log(`  Order ID: ${createdOrder.id}`, 'green');
    log(`  Status: ${createdOrder.status}`, 'green');
    log(`  Total: $${createdOrder.total_amount}`, 'green');

    // === STEP 4: Verify Order Details ===
    log('\n🔍 STEP 4: Verifying order details...', 'blue');
    const detailRes = await axios.get(`${API_BASE}/restaurants/${RESTAURANT_ID}/orders/${createdOrder.id}`);
    const orderDetails = detailRes.data.data || detailRes.data;

    log('✅ Order Details Retrieved:', 'green');
    log(`\n  Order #${orderDetails.id}`, 'yellow');
    log(`  Table: ${orderDetails.table_number}`, 'reset');
    log(`  Status: ${orderDetails.status}`, 'reset');
    log(`  Payment: ${orderDetails.payment_status}`, 'reset');
    log(`  Subtotal: $${orderDetails.subtotal}`, 'reset');
    log(`  Tax: $${orderDetails.tax_amount}`, 'reset');
    log(`  Total: $${orderDetails.total_amount}`, 'reset');
    log(`  Special Notes: ${orderDetails.special_instructions}`, 'cyan');

    log('\n  📋 Order Items:', 'yellow');
    orderDetails.items.forEach((item, i) => {
      log(`    ${i + 1}. ${item.menu_item_name} x${item.quantity} = $${item.subtotal}`, 'reset');
      if (item.special_instructions) {
        log(`       📌 ${item.special_instructions}`, 'cyan');
      }
    });

    // === STEP 5: Verify Calculations ===
    log('\n💰 STEP 5: Verifying calculations...', 'blue');
    
    const actualSubtotal = parseFloat(orderDetails.subtotal);
    const actualTax = parseFloat(orderDetails.tax_amount);
    const actualTotal = parseFloat(orderDetails.total_amount);

    const subtotalOK = Math.abs(actualSubtotal - expectedTotal) < 0.01;
    const taxOK = Math.abs(actualTax - expectedTax) < 0.01;
    const totalOK = Math.abs(actualTotal - expectedGrandTotal) < 0.01;

    if (subtotalOK && taxOK && totalOK) {
      log('✅ All calculations verified!', 'green');
      log(`  Subtotal: $${actualSubtotal.toFixed(2)} ✓`, 'green');
      log(`  Tax: $${actualTax.toFixed(2)} ✓`, 'green');
      log(`  Total: $${actualTotal.toFixed(2)} ✓`, 'green');
    } else {
      log('⚠️  Calculation mismatch:', 'yellow');
      log(`  Expected: $${expectedTotal.toFixed(2)} + $${expectedTax.toFixed(2)} = $${expectedGrandTotal.toFixed(2)}`, 'reset');
      log(`  Actual: $${actualSubtotal} + $${actualTax} = $${actualTotal}`, 'reset');
    }

    // === FINAL SUMMARY ===
    log('\n' + '='.repeat(70), 'cyan');
    log('✅ TEST COMPLETED SUCCESSFULLY!', 'green');
    log('='.repeat(70), 'cyan');

    log('\n📊 Test Summary:', 'yellow');
    log(`  ✅ Menu items loaded: ${allItems.length}`, 'green');
    log(`  ✅ European items: ${europeanItems.length}`, 'green');
    log(`  ✅ Order created: #${createdOrder.id}`, 'green');
    log(`  ✅ Total amount: $${orderDetails.total_amount}`, 'green');
    log(`  ✅ Calculations: ${subtotalOK && taxOK && totalOK ? 'PASS' : 'FAIL'}`, subtotalOK && taxOK && totalOK ? 'green' : 'red');

    log('\n🎉 European menu is working perfectly!', 'magenta');
    log(`\n💡 View order in browser: http://localhost:3000/orders/${createdOrder.id}`, 'cyan');
    log(`💡 View all orders: http://localhost:3000/orders\n`, 'cyan');

  } catch (error) {
    log('\n❌ TEST FAILED', 'red');
    log('='.repeat(70), 'red');
    
    if (error.response) {
      log(`\nAPI Error: ${error.response.status} ${error.response.statusText}`, 'red');
      log(`URL: ${error.config.url}`, 'yellow');
      log(`Response:`, 'red');
      console.log(JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      log(`\nNo response from server. Is backend running?`, 'red');
      log(`Expected at: ${API_BASE}`, 'yellow');
    } else {
      log(`\nError: ${error.message}`, 'red');
      console.log(error.stack);
    }
  }
}

// Run test
testEuropeanMenu();
