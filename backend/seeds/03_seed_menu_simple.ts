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
  
  // Menu items
  const menuItems = [
    // Appetizers
    {
      category_id: appetizersCat?.id,
      name: 'Spring Rolls',
      slug: createSlug('Spring Rolls'),
      description: 'Fresh vegetable spring rolls with peanut sauce',
      price: 8.99,
      is_available: true
    },
    {
      category_id: appetizersCat?.id,
      name: 'Chicken Wings',
      description: 'Crispy chicken wings with buffalo sauce',
      price: 12.99,
      is_available: true
    },
    
    // Main Courses
    {
      category_id: mainCoursesCat?.id,
      name: 'Grilled Salmon',
      description: 'Fresh Atlantic salmon with lemon butter sauce',
      price: 24.99,
      is_available: true
    },
    {
      category_id: mainCoursesCat?.id,
      name: 'Beef Steak',
      description: 'Prime ribeye steak with garlic mashed potatoes',
      price: 32.99,
      is_available: true
    },
    {
      category_id: mainCoursesCat?.id,
      name: 'Vegetable Stir Fry',
      description: 'Mixed vegetables in savory sauce with rice',
      price: 15.99,
      is_available: true
    },
    
    // Desserts
    {
      category_id: dessertsCat?.id,
      name: 'Chocolate Cake',
      description: 'Rich chocolate layer cake with ganache',
      price: 8.99,
      is_available: true
    },
    {
      category_id: dessertsCat?.id,
      name: 'Ice Cream Sundae',
      description: 'Vanilla ice cream with toppings',
      price: 6.99,
      is_available: true
    },
    
    // Beverages
    {
      category_id: beveragesCat?.id,
      name: 'Fresh Orange Juice',
      description: 'Freshly squeezed orange juice',
      price: 4.99,
      is_available: true
    },
    {
      category_id: beveragesCat?.id,
      name: 'Iced Coffee',
      description: 'Cold brew coffee with ice',
      price: 5.99,
      is_available: true
    },
  ];
  
  for (const item of menuItems) {
    if (item.category_id) {
      const exists = await knex('menu_items').where({ name: item.name }).first();
      if (!exists) {
        await knex('menu_items').insert(item);
        console.log(`✅ Created menu item: ${item.name}`);
      } else {
        console.log(`ℹ️  Menu item already exists: ${item.name}`);
      }
    }
  }
  
  console.log('✅ Menu seed completed successfully');
}
