const axios = require('axios');

async function testMenuAPI() {
  const baseURL = 'http://localhost:5000/api';
  
  try {
    console.log('🧪 Testing Menu API...\n');

    // Test health check
    console.log('1. Testing health check...');
    const health = await axios.get(`${baseURL}/health`);
    console.log('✅ Health check:', health.data);

    // Test menu categories
    console.log('\n2. Testing menu categories...');
    const categories = await axios.get(`${baseURL}/menu/categories`);
    console.log('✅ Categories:', categories.data);

    // Test menu items
    console.log('\n3. Testing menu items...');
    const items = await axios.get(`${baseURL}/menu/items?limit=5`);
    console.log('✅ Menu items:', items.data);

    // Test featured items
    console.log('\n4. Testing featured items...');
    const featured = await axios.get(`${baseURL}/menu/featured`);
    console.log('✅ Featured items:', featured.data);

    // Test full menu
    console.log('\n5. Testing full menu by category...');
    const fullMenu = await axios.get(`${baseURL}/menu/full`);
    console.log('✅ Full menu:', fullMenu.data);

    console.log('\n🎉 All tests passed!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testMenuAPI();