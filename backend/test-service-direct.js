// Test database connection directly from tableService
const path = require('path');

console.log('Testing tableService import and database connection...\n');

// Register ts-node to load TypeScript files
require('ts-node/register');

async function testService() {
  try {
    // Import database config
    const db = require('./src/config/database').default;
    console.log('✅ Database config imported');
    
    // Test raw query
    const testResult = await db.raw('SELECT 1 as test');
    console.log('✅ Raw query successful:', testResult);
    
    // Test tables query
    const tables = await db('tables')
      .where({ restaurant_id: 'f46275c0-9917-44fc-b144-e1e9cff89075', is_active: true })
      .orderBy('number', 'asc');
    
    console.log(`✅ Tables query successful, found ${tables.length} tables`);
    console.log('First table:', tables[0]);
    
    // Try importing tableService
    const tableService = require('./src/services/tableService').default;
    console.log('\n✅ TableService imported');
    
    // Test tableService method
    const serviceTables = await tableService.getTablesByRestaurant('f46275c0-9917-44fc-b144-e1e9cff89075');
    console.log(`✅ TableService.getTablesByRestaurant successful, found ${serviceTables.length} tables`);
    
    await db.destroy();
    console.log('\n✅ All tests passed!');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

testService();
