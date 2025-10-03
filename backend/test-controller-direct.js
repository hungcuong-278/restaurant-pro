// Test controller directly
require('ts-node/register');

async function testController() {
  console.log('Testing tableController directly...\n');
  
  try {
    const { getTables } = require('./src/controllers/tableController');
    console.log('✅ Controller imported');
    console.log('getTables type:', typeof getTables);
    
    // Mock Express Request and Response
    const mockReq = {
      params: {
        restaurantId: 'f46275c0-9917-44fc-b144-e1e9cff89075'
      },
      query: {}
    };
    
    let responseData = null;
    let responseStatus = 200;
    
    const mockRes = {
      json: (data) => {
        responseData = data;
        console.log('\n✅ Controller response:', JSON.stringify(data, null, 2));
      },
      status: (code) => {
        responseStatus = code;
        return mockRes;
      }
    };
    
    console.log('\nCalling getTables controller...');
    await getTables(mockReq, mockRes);
    
    if (responseData && responseData.success) {
      console.log(`\n✅ Controller test passed! Found ${responseData.data.length} tables`);
    } else {
      console.log('\n❌ Controller returned error:', responseData);
    }
    
    // Cleanup
    const db = require('./src/config/database').default;
    await db.destroy();
    
  } catch (error) {
    console.error('\n❌ Controller test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

testController();
