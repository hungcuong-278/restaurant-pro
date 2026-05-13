import knex from 'knex';
import config from './knexfile';

async function checkMenuSchema() {
  const db = knex(config.development);
  
  try {
    const schema = await db.raw('PRAGMA table_info(menu_categories)');
    console.log('📋 menu_categories schema:');
    console.log(JSON.stringify(schema, null, 2));
  } catch (error: any) {
    console.error('❌ Error:', error.message);
  } finally {
    await db.destroy();
  }
}

checkMenuSchema();
