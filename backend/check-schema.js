// Check database schema
const knex = require('knex');
const config = require('./knexfile.ts').default;

const db = knex(config.development);

async function checkSchema() {
  try {
    console.log('Checking database schema...\n');
    
    // Check tables structure
    const tablesInfo = await db.raw("PRAGMA table_info(tables)");
    console.log('📋 Tables columns:', tablesInfo);
    
    console.log('\n');
    
    // Check reservations structure
    const reservationsInfo = await db.raw("PRAGMA table_info(reservations)");
    console.log('📅 Reservations columns:', reservationsInfo);
    
    console.log('\n');
    
    // Check actual restaurants
    const restaurants = await db('restaurants').select('*');
    console.log('🏢 Restaurants:', restaurants);
    
    await db.destroy();
    
  } catch (error) {
    console.error('❌ Error:', error);
    await db.destroy();
  }
}

checkSchema();