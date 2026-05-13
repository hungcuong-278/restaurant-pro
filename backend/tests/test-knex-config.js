const knex = require('knex');

// Test exact config from database.ts
const dbConfig = {
  client: 'sqlite3',
  connection: {
    filename: './database/dev.sqlite3'
  },
  useNullAsDefault: true,
  pool: {
    min: 2,
    max: 10
  },
  migrations: {
    tableName: 'knex_migrations',
    directory: './migrations'
  },
  seeds: {
    directory: './seeds'
  }
};

async function testKnexConfig() {
  console.log('Current directory:', process.cwd());
  
  const db = knex(dbConfig);
  
  try {
    // Test connection
    await db.raw('SELECT 1');
    console.log('✅ Knex connection successful');
    
    // Test schema
    const schema = await db.raw("PRAGMA table_info(tables)");
    console.log('Tables schema:', schema.length, 'columns');
    schema.forEach(col => console.log(`  ${col.cid}: ${col.name} (${col.type})`));
    
    // Test the actual query from tableService
    const testQuery = db('tables')
      .where({ restaurant_id: 'f46275c0-9917-44fc-b144-e1e9cff89075', is_active: true })
      .orderBy('number', 'asc');
    
    console.log('\nGenerated SQL:', testQuery.toString());
    
    const result = await testQuery;
    console.log('\n✅ Query successful, rows:', result.length);
    if (result.length > 0) {
      console.log('First row:', result[0]);
    }
    
  } catch (error) {
    console.error('❌ Knex test failed:', error.message);
    console.error('Error details:', error);
  } finally {
    await db.destroy();
  }
}

testKnexConfig();