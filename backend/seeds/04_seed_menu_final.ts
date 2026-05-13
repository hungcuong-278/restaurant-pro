import { Knex } from 'knex';

// Helper to create slug from name
function createSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

export async function seed(knex: Knex): Promise<void> {
  // Don't delete existing data, just add if not exists
  
  console.log('Seeding menu categories...');
  
  // Check and insert categories
  const categories = [
    { name: 'Appetizers', slug: 'appetizers', description: 'Start your meal with these delicious appetizers' },
    { name: 'Main Courses', slug: 'main-courses', description: 'Our signature main dishes' },
    { name: 'Desserts', slug: 'desserts', description: 'Sweet endings to your meal' },
    { name: 'Beverages', slug: 'beverages', description: 'Refreshing drinks' },
  ];
  
  for (const category of categories) {
    const exists = await knex('menu_categories').where({ name: category.name }).first();
    if (!exists) {
      await knex('menu_categories').insert(category);
      console.log(`✅ Created category: ${category.name}`);
    } else {
      console.log(`ℹ️  Category already exists: ${category.name}`);
    }
  }
  
  console.log('Seeding menu items...');
  
  // Get category IDs
  const appetizersCat = await knex('menu_categories').where({ name: 'Appetizers' }).first();
  const mainCoursesCat = await knex('menu_categories').where({ name: 'Main Courses' }).first();
  const dessertsCat = await knex('menu_categories').where({ name: 'Desserts' }).first();
  const beveragesCat = await knex('menu_categories').where({ name: 'Beverages' }).first();
  
  // Menu items with slug
  const menuItemsData = [
    { name: 'Spring Rolls', category: appetizersCat, description: 'Fresh vegetable spring rolls with peanut sauce', price: 8.99 },
    { name: 'Chicken Wings', category: appetizersCat, description: 'Crispy chicken wings with buffalo sauce', price: 12.99 },
    { name: 'Grilled Salmon', category: mainCoursesCat, description: 'Fresh Atlantic salmon with lemon butter sauce', price: 24.99 },
    { name: 'Beef Steak', category: mainCoursesCat, description: 'Prime ribeye steak with garlic mashed potatoes', price: 32.99 },
    { name: 'Vegetable Stir Fry', category: mainCoursesCat, description: 'Mixed vegetables in savory sauce with rice', price: 15.99 },
    { name: 'Chocolate Cake', category: dessertsCat, description: 'Rich chocolate layer cake with ganache', price: 8.99 },
    { name: 'Ice Cream Sundae', category: dessertsCat, description: 'Vanilla ice cream with toppings', price: 6.99 },
    { name: 'Fresh Orange Juice', category: beveragesCat, description: 'Freshly squeezed orange juice', price: 4.99 },
    { name: 'Iced Coffee', category: beveragesCat, description: 'Cold brew coffee with ice', price: 5.99 },
  ];
  
  for (const itemData of menuItemsData) {
    if (itemData.category?.id) {
      const exists = await knex('menu_items').where({ name: itemData.name }).first();
      if (!exists) {
        await knex('menu_items').insert({
          category_id: itemData.category.id,
          name: itemData.name,
          slug: createSlug(itemData.name),
          description: itemData.description,
          price: itemData.price,
          is_available: true
        });
        console.log(`✅ Created menu item: ${itemData.name}`);
      } else {
        console.log(`ℹ️  Menu item already exists: ${itemData.name}`);
      }
    }
  }
  
  console.log('✅ Menu seed completed successfully');
}
