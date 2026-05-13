import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

async function testAuthentication() {
  console.log('🧪 Testing Authentication APIs...\n');
  
  try {
    // Test 1: Login with admin
    console.log('1️⃣ Testing Admin Login...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@restaurant.com',
      password: 'admin123'
    });
    
    console.log('✅ Admin Login Success!');
    console.log('   Token:', loginResponse.data.token?.substring(0, 20) + '...');
    console.log('   User:', loginResponse.data.user?.email);
    console.log('   Role:', loginResponse.data.user?.role);
    
    const adminToken = loginResponse.data.token;
    
    // Test 2: Login with customer
    console.log('\n2️⃣ Testing Customer Login...');
    const customerLogin = await axios.post(`${API_URL}/auth/login`, {
      email: 'customer@test.com',
      password: 'password123'
    });
    
    console.log('✅ Customer Login Success!');
    console.log('   User:', customerLogin.data.user?.email);
    console.log('   Role:', customerLogin.data.user?.role);
    
    // Test 3: Register new user
    console.log('\n3️⃣ Testing User Registration...');
    try {
      const registerResponse = await axios.post(`${API_URL}/auth/register`, {
        email: `test${Date.now()}@example.com`,
        password: 'password123',
        first_name: 'New',
        last_name: 'User',
        phone: '0909090909'
      });
      
      console.log('✅ Registration Success!');
      console.log('   User:', registerResponse.data.user?.email);
    } catch (registerError: any) {
      console.log('⚠️  Registration test skipped or failed:', registerError.response?.data?.message || registerError.message);
    }
    
    // Test 4: Get current user (with token)
    console.log('\n4️⃣ Testing Get Current User...');
    const meResponse = await axios.get(`${API_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });
    
    console.log('✅ Get Current User Success!');
    console.log('   User:', meResponse.data.user?.email);
    console.log('   Role:', meResponse.data.user?.role);
    
    // Test 5: Invalid login
    console.log('\n5️⃣ Testing Invalid Login...');
    try {
      await axios.post(`${API_URL}/auth/login`, {
        email: 'wrong@email.com',
        password: 'wrongpassword'
      });
      console.log('❌ Invalid login should have failed!');
    } catch (error: any) {
      console.log('✅ Invalid login correctly rejected');
      console.log('   Message:', error.response?.data?.message);
    }
    
    console.log('\n✅ All authentication tests completed!');
    
  } catch (error: any) {
    console.error('\n❌ Test failed:', error.response?.data || error.message);
    console.error('   Status:', error.response?.status);
  }
}

// Run tests
testAuthentication();
