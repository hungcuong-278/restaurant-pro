import knex from 'knex';
import config from './knexfile';

async function checkDatabase() {
  const db = knex(config.development);
  
  try {
    // Check tables
    const tables = await db.raw("SELECT name FROM sqlite_master WHERE type='table'");
    console.log('📋 Tables in database:', tables);
    
    // Check if users table exists
    try {
      const userCount = await db('users').count('* as count').first();
      console.log('👥 User count:', userCount);
      
      const users = await db('users').select('id', 'email', 'role');
      console.log('👥 Users:', users);
    } catch (err) {
      console.log('⚠️ Users table does not exist');
    }
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
  } finally {
    await db.destroy();
  }
}

checkDatabase();
