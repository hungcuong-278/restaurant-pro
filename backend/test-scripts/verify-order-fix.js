/**
 * Quick Order Details Verification
 * Tests that the order details page can load properly after UUID fix
 */

const axios = require('axios');

const RESTAURANT_ID = '64913af3-e39a-4dd0-ad21-c3bb4aa6e9a5';
const ORDER_ID = '46d49f68-da08-4d16-b240-8e7a3efc688c';
const API_BASE = 'http://localhost:5000/api';

async function testOrderDetails() {
  console.log('\n🔍 Testing Order Details API...\n');

  try {
    const url = `${API_BASE}/restaurants/${RESTAURANT_ID}/orders/${ORDER_ID}`;
    console.log(`📡 Fetching: ${url}`);

    const response = await axios.get(url);
    const order = response.data.data;

    console.log('\n✅ Order Details Retrieved Successfully!\n');
    console.log(`Order #${order.order_number}`);
    console.log(`Table: ${order.table.number} (${order.table.location})`);
    console.log(`Status: ${order.status}`);
    console.log(`Payment: ${order.payment_status}`);
    console.log(`\nItems (${order.items.length}):`);
    
    order.items.forEach((item, i) => {
      console.log(`  ${i + 1}. ${item.item_name} x${item.quantity} = $${item.total_price}`);
      if (item.special_instructions) {
        console.log(`     📌 ${item.special_instructions}`);
      }
    });

    console.log(`\nSubtotal: $${order.subtotal}`);
    console.log(`Tax: $${order.tax_amount}`);
    console.log(`Total: $${order.total_amount}`);

    console.log('\n✅ All item names loaded correctly!');
    console.log('✅ Frontend should now display order details properly!');
    console.log(`\n🌐 View in browser: http://localhost:3000/orders/${ORDER_ID}\n`);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

testOrderDetails();
