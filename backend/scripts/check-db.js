const knex = require('knex');
const config = require('./knexfile.ts');

async function checkDatabase() {
  const db = knex(config.development);
  
  try {
    // Check tables
    const tables = await db.raw("SELECT name FROM sqlite_master WHERE type='table'");
    console.log('📋 Tables in database:', tables);
    
    // Check users
    const userCount = await db('users').count('* as count').first();
    console.log('👥 User count:', userCount);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await db.destroy();
  }
}

checkDatabase();
