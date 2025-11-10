/**
 * Get Real Test Data from Database
 */

const knex = require('knex')(require('./knexfile').development);

async function getData() {
  console.log('📊 Fetching test data from database...\n');
  
  try {
    // Get menu items
    const menuItems = await knex('menu_items')
      .where({ available: true })
      .limit(10)
      .select('id', 'name', 'price');
    
    console.log('🍕 Menu Items:');
    menuItems.forEach((item, i) => {
      console.log(`  ${i + 1}. ${item.name} - $${item.price}`);
      console.log(`     ID: ${item.id}`);
    });
    
    // Get tables
    const tables = await knex('tables')
      .where({ status: 'available' })
      .limit(10)
      .select('id', 'table_number', 'capacity');
    
    console.log('\n🪑 Tables:');
    tables.forEach((table, i) => {
      console.log(`  ${i + 1}. Table ${table.table_number} (${table.capacity} seats)`);
      console.log(`     ID: ${table.id}`);
    });
    
    // Export as JavaScript array
    console.log('\n\n📋 Copy this to test script:');
    console.log('\nconst MENU_ITEMS = [');
    menuItems.forEach(item => {
      console.log(`  '${item.id}', // ${item.name}`);
    });
    console.log('];');
    
    console.log('\nconst TABLES = [');
    tables.forEach(table => {
      console.log(`  '${table.id}', // Table ${table.table_number}`);
    });
    console.log('];');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await knex.destroy();
  }
}

getData();
