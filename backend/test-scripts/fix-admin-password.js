const bcrypt = require('bcrypt');
const knex = require('knex');
const path = require('path');

// Import knexfile config
const knexConfig = {
  client: 'sqlite3',
  connection: {
    filename: path.join(__dirname, 'database', 'dev.sqlite3')
  },
  useNullAsDefault: true,
  migrations: {
    directory: path.join(__dirname, 'migrations')
  }
};

const db = knex(knexConfig);

async function fixAdminPassword() {
  try {
    console.log('Generating new password hash...');
    const hash = await bcrypt.hash('admin123', 12);
    console.log('Hash generated:', hash);
    
    console.log('\nUpdating admin password...');
    await db('users')
      .where({ email: 'admin@restaurant.com' })
      .update({ password_hash: hash });
    
    console.log('✅ Admin password updated successfully!');
    
    // Verify
    const user = await db('users')
      .where({ email: 'admin@restaurant.com' })
      .first();
    
    console.log('\nVerifying password...');
    const isValid = await bcrypt.compare('admin123', user.password_hash);
    console.log('Password valid:', isValid);
    
    if (isValid) {
      console.log('\n🎉 Password fix successful!');
    } else {
      console.log('\n❌ Password fix failed!');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await db.destroy();
  }
}

fixAdminPassword();
