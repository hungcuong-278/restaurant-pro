import knex from 'knex';
import config from './knexfile';

async function checkUsersSchema() {
  const db = knex(config.development);
  
  try {
    const schema = await db.raw('PRAGMA table_info(users)');
    console.log('👤 Users table schema:');
    console.log(JSON.stringify(schema, null, 2));
  } catch (error: any) {
    console.error('❌ Error:', error.message);
  } finally {
    await db.destroy();
  }
}

checkUsersSchema();
