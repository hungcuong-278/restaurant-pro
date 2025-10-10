/**
 * Quick Menu Verification After Fix
 */

const axios = require('axios');

const RESTAURANT_ID = '64913af3-e39a-4dd0-ad21-c3bb4aa6e9a5';
const API_BASE = 'http://localhost:5000/api';

async function quickTest() {
  console.log('\n🔍 Quick Menu Test\n');

  try {
    // Get menu items
    const url = `${API_BASE}/menu/items?restaurant_id=${RESTAURANT_ID}&limit=100`;
    const response = await axios.get(url);
    const items = response.data.data.items;

    console.log(`✅ Loaded ${items.length} menu items\n`);

    // Show first 10
    console.log('First 10 items:');
    items.slice(0, 10).forEach((item, i) => {
      console.log(`  ${i + 1}. ${item.name} - $${item.price} (${item.category_name})`);
    });

    console.log(`\n✅ Frontend should now display menu!`);
    console.log(`🌐 Test: http://localhost:3000/orders/new\n`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

quickTest();
