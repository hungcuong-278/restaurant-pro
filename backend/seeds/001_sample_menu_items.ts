import { Knex } from 'knex';
import { v4 as uuidv4 } from 'uuid';

export async function seed(knex: Knex): Promise<void> {
  const restaurantId = 'default';

  // Check if we already have menu items for this restaurant
  const existingItems = await knex('menu_items')
    .where('restaurant_id', restaurantId)
    .count('* as count')
    .first();

  // Only seed if database is empty
  if (existingItems && Number(existingItems.count) > 0) {
    console.log('⏭️  Menu items already exist, skipping seed...');
    return;
  }

  console.log('🌱 Seeding sample menu items...');

  // Insert menu categories
  const categories = [
    {
      id: uuidv4(),
      restaurant_id: restaurantId,
      name: 'Appetizers',
      slug: 'appetizers',
      description: 'Start your meal with our delicious appetizers',
      sort_order: 1,
      is_active: true
    },
    {
      id: uuidv4(),
      restaurant_id: restaurantId,
      name: 'Main Courses',
      slug: 'main-courses',
      description: 'Our signature main dishes',
      sort_order: 2,
      is_active: true
    },
    {
      id: uuidv4(),
      restaurant_id: restaurantId,
      name: 'Desserts',
      slug: 'desserts',
      description: 'Sweet endings to your perfect meal',
      sort_order: 3,
      is_active: true
    },
    {
      id: uuidv4(),
      restaurant_id: restaurantId,
      name: 'Beverages',
      slug: 'beverages',
      description: 'Refreshing drinks and beverages',
      sort_order: 4,
      is_active: true
    }
  ];

  await knex('menu_categories').insert(categories);

  // Get category IDs for reference
  const appetizersCategory = await knex('menu_categories')
    .where({ restaurant_id: restaurantId, slug: 'appetizers' })
    .first();
  const mainCoursesCategory = await knex('menu_categories')
    .where({ restaurant_id: restaurantId, slug: 'main-courses' })
    .first();
  const dessertsCategory = await knex('menu_categories')
    .where({ restaurant_id: restaurantId, slug: 'desserts' })
    .first();
  const beveragesCategory = await knex('menu_categories')
    .where({ restaurant_id: restaurantId, slug: 'beverages' })
    .first();

  // Insert menu items
  const menuItems = [
    // Appetizers
    {
      id: uuidv4(),
      restaurant_id: restaurantId,
      category_id: appetizersCategory?.id,
      name: 'Spring Rolls',
      slug: 'spring-rolls',
      description: 'Fresh Vietnamese spring rolls with shrimp and herbs',
      price: 85000,
      image_url: 'https://images.unsplash.com/photo-1594756202469-9ff9799b2e4e?w=400',
      allergens: JSON.stringify(['shellfish']),
      dietary_info: JSON.stringify(['gluten-free']),
      preparation_time: 15,
      is_available: true,
      is_featured: true,
      sort_order: 1
    },
    {
      id: uuidv4(),
      restaurant_id: restaurantId,
      category_id: appetizersCategory?.id,
      name: 'Caesar Salad',
      slug: 'caesar-salad',
      description: 'Classic Caesar salad with crispy croutons and parmesan',
      price: 95000,
      image_url: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400',
      allergens: JSON.stringify(['dairy', 'gluten']),
      dietary_info: JSON.stringify(['vegetarian']),
      preparation_time: 10,
      is_available: true,
      is_featured: false,
      sort_order: 2
    },
    
    // Main Courses
    {
      id: uuidv4(),
      restaurant_id: restaurantId,
      category_id: mainCoursesCategory?.id,
      name: 'Grilled Salmon',
      slug: 'grilled-salmon',
      description: 'Fresh Atlantic salmon grilled to perfection with lemon butter',
      price: 285000,
      image_url: 'https://images.unsplash.com/photo-1485921325833-c519f76c4927?w=400',
      allergens: JSON.stringify(['fish']),
      dietary_info: JSON.stringify(['gluten-free']),
      preparation_time: 25,
      is_available: true,
      is_featured: true,
      sort_order: 1
    },
    {
      id: uuidv4(),
      restaurant_id: restaurantId,
      category_id: mainCoursesCategory?.id,
      name: 'Beef Steak',
      slug: 'beef-steak',
      description: 'Premium beef tenderloin with red wine sauce and mashed potatoes',
      price: 350000,
      image_url: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=400',
      allergens: JSON.stringify(['dairy']),
      dietary_info: JSON.stringify([]),
      preparation_time: 30,
      is_available: true,
      is_featured: true,
      sort_order: 2
    },
    {
      id: uuidv4(),
      restaurant_id: restaurantId,
      category_id: mainCoursesCategory?.id,
      name: 'Vegetarian Pasta',
      slug: 'vegetarian-pasta',
      description: 'Fresh pasta with seasonal vegetables in tomato sauce',
      price: 185000,
      image_url: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400',
      allergens: JSON.stringify(['gluten']),
      dietary_info: JSON.stringify(['vegetarian']),
      preparation_time: 20,
      is_available: true,
      is_featured: false,
      sort_order: 3
    },
    {
      id: uuidv4(),
      restaurant_id: restaurantId,
      category_id: mainCoursesCategory?.id,
      name: 'Chicken Curry',
      slug: 'chicken-curry',
      description: 'Aromatic chicken curry with coconut milk and jasmine rice',
      price: 165000,
      image_url: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=400',
      allergens: JSON.stringify([]),
      dietary_info: JSON.stringify(['gluten-free']),
      preparation_time: 25,
      is_available: true,
      is_featured: false,
      sort_order: 4
    },

    // Desserts
    {
      id: uuidv4(),
      restaurant_id: restaurantId,
      category_id: dessertsCategory?.id,
      name: 'Tiramisu',
      slug: 'tiramisu',
      description: 'Classic Italian tiramisu with espresso and mascarpone',
      price: 95000,
      image_url: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400',
      allergens: JSON.stringify(['dairy', 'eggs']),
      dietary_info: JSON.stringify(['vegetarian']),
      preparation_time: 10,
      is_available: true,
      is_featured: true,
      sort_order: 1
    },
    {
      id: uuidv4(),
      restaurant_id: restaurantId,
      category_id: dessertsCategory?.id,
      name: 'Chocolate Lava Cake',
      slug: 'chocolate-lava-cake',
      description: 'Warm chocolate cake with molten center and vanilla ice cream',
      price: 125000,
      image_url: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=400',
      allergens: JSON.stringify(['dairy', 'eggs', 'gluten']),
      dietary_info: JSON.stringify(['vegetarian']),
      preparation_time: 15,
      is_available: true,
      is_featured: false,
      sort_order: 2
    },

    // Beverages
    {
      id: uuidv4(),
      restaurant_id: restaurantId,
      category_id: beveragesCategory?.id,
      name: 'Fresh Orange Juice',
      slug: 'fresh-orange-juice',
      description: 'Freshly squeezed orange juice',
      price: 45000,
      image_url: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400',
      allergens: JSON.stringify([]),
      dietary_info: JSON.stringify(['vegan', 'gluten-free']),
      preparation_time: 5,
      is_available: true,
      is_featured: false,
      sort_order: 1
    },
    {
      id: uuidv4(),
      restaurant_id: restaurantId,
      category_id: beveragesCategory?.id,
      name: 'Vietnamese Coffee',
      slug: 'vietnamese-coffee',
      description: 'Strong coffee with condensed milk served hot or iced',
      price: 55000,
      image_url: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400',
      allergens: JSON.stringify(['dairy']),
      dietary_info: JSON.stringify([]),
      preparation_time: 5,
      is_available: true,
      is_featured: true,
      sort_order: 2
    },
    {
      id: uuidv4(),
      restaurant_id: restaurantId,
      category_id: beveragesCategory?.id,
      name: 'Mojito',
      slug: 'mojito',
      description: 'Classic mojito with fresh mint and lime',
      price: 85000,
      image_url: 'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=400',
      allergens: JSON.stringify([]),
      dietary_info: JSON.stringify(['vegan', 'gluten-free']),
      preparation_time: 8,
      is_available: true,
      is_featured: false,
      sort_order: 3
    }
  ];

  await knex('menu_items').insert(menuItems);

  console.log('✅ Seeded sample menu items successfully!');
}
