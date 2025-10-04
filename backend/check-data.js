const knex = require('knex')({
  client: 'sqlite3',
  connection: {
    filename: './database/dev.sqlite3'
  },
  useNullAsDefault: true
});

async function checkData() {
  try {
    // Get restaurant
    const restaurants = await knex('restaurants').select('*');
    console.log('Restaurants:', JSON.stringify(restaurants, null, 2));
    
    if (restaurants.length > 0) {
      const restaurantId = restaurants[0].id;
      
      // Get menu items count
      const menuCount = await knex('menu_items')
        .where('restaurant_id', restaurantId)
        .count('* as count')
        .first();
      console.log(`\nMenu items count: ${menuCount.count}`);
      
      // Get some menu items
      const menuItems = await knex('menu_items')
        .where('restaurant_id', restaurantId)
        .limit(5)
        .select('name', 'price', 'description');
      console.log('\nSample menu items:');
      menuItems.forEach(item => {
        console.log(`  - ${item.name} ($${item.price})`);
      });
      
      // Get tables
      const tables = await knex('tables')
        .where('restaurant_id', restaurantId)
        .select('*');
      console.log(`\nTables: ${tables.length}`);
      tables.forEach(t => {
        console.log(`  - ${t.table_number} (${t.status})`);
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkData();
