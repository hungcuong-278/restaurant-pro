/**
 * Update menu items to be available for testing
 */

import db from './src/config/database';

async function updateMenuItems() {
  try {
    console.log('Updating menu items to available...');
    
    const result = await db('menu_items')
      .where({ restaurant_id: 'e4e7bcd3-3b50-47ba-8abc-3597170677bb' })
      .update({ is_available: true });
    
    console.log(`✅ Updated ${result} menu items to available`);
    
    // Show first 5 items
    const items = await db('menu_items')
      .where({ restaurant_id: 'e4e7bcd3-3b50-47ba-8abc-3597170677bb' })
      .limit(5)
      .select('id', 'name', 'price', 'is_available');
    
    console.log('\nSample items:');
    items.forEach(item => {
      console.log(`  - ${item.name}: $${item.price} (${item.is_available ? 'Available' : 'Not available'})`);
      console.log(`    ID: ${item.id}`);
    });
    
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

updateMenuItems();
