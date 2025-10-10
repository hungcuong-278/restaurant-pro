import knex from 'knex';
import knexConfig from './knexfile';

const db = knex(knexConfig.development);

async function checkAdmin() {
  try {
    const admin = await db('users')
      .where('email', 'admin@restaurant.com')
      .first();
    
    console.log('=== ADMIN ACCOUNT ===');
    if (admin) {
      console.log('✅ Admin exists:');
      console.log(JSON.stringify(admin, null, 2));
    } else {
      console.log('❌ Admin not found!');
    }
    
    // Check all users
    const allUsers = await db('users').select('id', 'email', 'name', 'role');
    console.log('\n=== ALL USERS ===');
    console.log(JSON.stringify(allUsers, null, 2));
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkAdmin();
