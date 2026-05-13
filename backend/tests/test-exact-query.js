// Test exact query from tableService
require('ts-node/register');

async function testExactQuery() {
  console.log('Testing exact query from tableService...\n');
  
  try {
    const db = require('./src/config/database').default;
    const restaurantId = 'f46275c0-9917-44fc-b144-e1e9cff89075';
    
    console.log('Restaurant ID:', restaurantId);
    console.log('Query: SELECT * FROM tables WHERE restaurant_id = ? AND is_active = ? ORDER BY number ASC\n');
    
    // Test exact query from tableService
    console.log('Method 1: Using object syntax (tableService method)');
    try {
      const result1 = await db('tables')
        .where({ restaurant_id: restaurantId, is_active: true })
        .orderBy('number', 'asc');
      console.log('✅ Success! Found', result1.length, 'tables');
      console.log('First table:', result1[0]);
    } catch (error) {
      console.error('❌ Failed:', error.message);
    }
    
    // Test with string keys
    console.log('\nMethod 2: Using string keys');
    try {
      const result2 = await db('tables')
        .where('restaurant_id', restaurantId)
        .where('is_active', true)
        .orderBy('number', 'asc');
      console.log('✅ Success! Found', result2.length, 'tables');
    } catch (error) {
      console.error('❌ Failed:', error.message);
    }
    
    // Test with whereRaw
    console.log('\nMethod 3: Using whereRaw');
    try {
      const result3 = await db('tables')
        .whereRaw('restaurant_id = ? AND is_active = ?', [restaurantId, true])
        .orderBy('number', 'asc');
      console.log('✅ Success! Found', result3.length, 'tables');
    } catch (error) {
      console.error('❌ Failed:', error.message);
    }
    
    await db.destroy();
    
  } catch (error) {
    console.error('\n❌ Overall error:', error.message);
    console.error('Stack:', error.stack);
  }
}

testExactQuery();
