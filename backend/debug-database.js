// Debug database connection
require('ts-node/register');

async function debugDatabaseConnection() {
  console.log('Debugging database connection...\n');
  
  try {
    const db = require('./src/config/database').default;
    console.log('✅ Database imported');
    console.log('DB client:', db.client.config.client);
    console.log('DB connection:', db.client.config.connection);
    console.log('DB connection filename:', db.client.config.connection.filename);
    
    // Get absolute path
    const path = require('path');
    const absolutePath = path.resolve(db.client.config.connection.filename);
    console.log('Absolute path:', absolutePath);
    
    // Check if file exists
    const fs = require('fs');
    console.log('File exists:', fs.existsSync(absolutePath));
    
    // Test raw query
    console.log('\nTesting raw query...');
    const schema = await db.raw("PRAGMA table_info(tables)");
    console.log(`Found ${schema.length} columns:`);
    schema.forEach(col => {
      console.log(`  - ${col.name} (${col.type})`);
    });
    
    // Test if Knex can see restaurant_id
    console.log('\nTesting Knex column detection...');
    const columns = await db('tables').columnInfo();
    console.log('Knex columns:', Object.keys(columns));
    
    // Try a simple select
    console.log('\nTesting simple select...');
    const count = await db('tables').count('* as count').first();
    console.log('Total tables:', count);
    
    // Try select with where
    console.log('\nTesting select with explicit columns...');
    const result = await db('tables')
      .select('id', 'restaurant_id', 'number')
      .limit(1);
    console.log('Result:', result);
    
    await db.destroy();
    console.log('\n✅ All tests completed');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

debugDatabaseConnection();
