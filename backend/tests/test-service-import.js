// Test import database config from tableService perspective
const path = require('path');

console.log('Current directory:', process.cwd());
console.log('Attempting to import from:', path.resolve('./src/config/database.ts'));

// Try importing the TypeScript file directly
try {
  require('ts-node/register');
  const dbConfig = require('./src/config/database.ts');
  console.log('✅ TypeScript import successful');
  console.log('DB default export type:', typeof dbConfig.default);
  console.log('DB config keys:', Object.keys(dbConfig));
  
  // Test the actual database connection
  const db = dbConfig.default;
  
  async function testService() {
    try {
      const result = await db('tables')
        .where({ restaurant_id: 'f46275c0-9917-44fc-b144-e1e9cff89075', is_active: true })
        .orderBy('number', 'asc');
      
      console.log('✅ Service-style query successful, rows:', result.length);
    } catch (error) {
      console.error('❌ Service-style query failed:', error.message);
    } finally {
      await db.destroy();
    }
  }
  
  testService();
  
} catch (error) {
  console.error('❌ TypeScript import failed:', error.message);
}