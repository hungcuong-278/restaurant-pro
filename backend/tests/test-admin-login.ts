import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

async function testAdminLogin() {
  try {
    console.log('🔐 Testing Admin Login...\n');
    
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@restaurant.com',
      password: 'admin123'
    });
    
    if (response.data.success) {
      console.log('✅ Admin Login SUCCESS!');
      console.log('Token:', response.data.token);
      console.log('User:', JSON.stringify(response.data.user, null, 2));
      
      // Test getting admin profile
      console.log('\n🔍 Testing Get Profile...\n');
      const profileResponse = await axios.get(`${API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${response.data.token}`
        }
      });
      
      if (profileResponse.data.success) {
        console.log('✅ Get Profile SUCCESS!');
        console.log('Profile:', JSON.stringify(profileResponse.data.user, null, 2));
      }
    }
  } catch (error: any) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testAdminLogin();
