import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

async function testMenuAPI() {
  console.log('🧪 Testing Menu APIs...\n');
  
  try {
    // Test 1: Get categories
    console.log('1️⃣ Testing Get Categories...');
    const categoriesResponse = await axios.get(`${API_URL}/menu/categories`);
    
    console.log('✅ Get Categories Success!');
    console.log('   Categories found:', categoriesResponse.data.categories?.length || 0);
    console.log('   Categories:', categoriesResponse.data.categories?.map((c: any) => c.name));
    
    // Test 2: Get menu items
    console.log('\n2️⃣ Testing Get Menu Items...');
    const menuResponse = await axios.get(`${API_URL}/menu`);
    
    console.log('✅ Get Menu Items Success!');
    console.log('   Items found:', menuResponse.data.items?.length || 0);
    
    console.log('\n✅ All menu tests completed!');
    
  } catch (error: any) {
    console.error('\n❌ Test failed:', error.response?.data || error.message);
    console.error('   Status:', error.response?.status);
    console.error('   URL:', error.config?.url);
  }
}

// Run tests
testMenuAPI();
