// Direct database debug
const knex = require('knex');

// Try with direct SQLite config
const db = knex({
  client: 'sqlite3',
  connection: {
    filename: './database/dev.sqlite3'
  },
  useNullAsDefault: true
});

async function testDirectQuery() {
  try {
    console.log('🔍 Testing direct table query...\n');
    
    // Test 1: Basic select
    console.log('1. Testing basic select...');
    const allTables = await db('tables').select('*');
    console.log('✅ All tables count:', allTables.length);
    
    if (allTables.length > 0) {
      console.log('📋 Sample table:', JSON.stringify(allTables[0], null, 2));
    }
    
    // Test 2: Test with restaurant_id filter
    console.log('\n2. Testing restaurant_id filter...');
    const restaurantId = 'f46275c0-9917-44fc-b144-e1e9cff89075';
    const filteredTables = await db('tables').where({ restaurant_id: restaurantId });
    console.log('✅ Filtered tables count:', filteredTables.length);
    
    // Test 3: Test exact query from service
    console.log('\n3. Testing exact service query...');
    const serviceQuery = await db('tables')
      .where({ restaurant_id: restaurantId, is_active: true })
      .orderBy('number', 'asc');
    console.log('✅ Service query result count:', serviceQuery.length);
    
    await db.destroy();
    console.log('\n✅ All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
    await db.destroy();
  }
}

testDirectQuery();