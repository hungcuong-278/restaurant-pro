const knex = require('knex')({
  client: 'sqlite3',
  connection: {
    filename: './database/dev.sqlite3'
  },
  useNullAsDefault: true
});

async function checkData() {
  try {
    console.log('🔍 Checking restaurant data...\n');
    
    // Get restaurants
    const restaurants = await knex('restaurants').select('*');
    console.log('📍 Restaurants:', restaurants.length);
    if (restaurants.length > 0) {
      console.log('   Restaurant ID:', restaurants[0].id);
      console.log('   Name:', restaurants[0].name);
      console.log('');
      
      // Get tables for this restaurant
      const tables = await knex('tables')
        .where('restaurant_id', restaurants[0].id)
        .select('*');
      
      console.log('🪑 Tables:', tables.length);
      tables.forEach(table => {
        console.log(`   - ${table.number}: capacity ${table.capacity}, status: ${table.status}`);
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkData();
