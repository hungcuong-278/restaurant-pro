import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex('menu_items').del();
  await knex('menu_categories').del();
  await knex('tables').del();
  await knex('restaurants').del();
  await knex('users').del();

  // Seed Users
  const [adminUser] = await knex('users').insert([
    {
      id: knex.fn.uuid(),
      email: 'admin@restaurant.com',
      password_hash: '$2b$10$2xeym8ABQMKC3fi2CyeSBeY4ku6SnznP72w4FHYZ.SQPepAJdwhUW', // admin123
      first_name: 'Restaurant',
      last_name: 'Admin',
      role: 'admin',
      phone: '+1234567890',
      is_active: true,
      email_verified: true
    },
    {
      id: knex.fn.uuid(),
      email: 'chef@restaurant.com',
      password_hash: '$2b$10$C83Qyjq.sYLuyqHemcqE6eZE4Pjs/S7aYjAtyDe.xeak1CDVUmiHu', // chef123
      first_name: 'Head',
      last_name: 'Chef',
      role: 'manager',
      phone: '+1234567891',
      is_active: true,
      email_verified: true
    }
  ]).returning('*');

  // Seed Restaurant
  const [restaurant] = await knex('restaurants').insert([
    {
      id: knex.fn.uuid(),
      name: 'Golden Fork Restaurant',
      slug: 'golden-fork',
      description: 'Fine dining experience with modern cuisine and exceptional service.',
      address: '123 Main Street, Downtown City, State 12345',
      phone: '+1234567892',
      email: 'info@goldenfork.com',
      website: 'https://goldenfork.com',
      business_hours: JSON.stringify({
        monday: { open: '11:00', close: '22:00' },
        tuesday: { open: '11:00', close: '22:00' },
        wednesday: { open: '11:00', close: '22:00' },
        thursday: { open: '11:00', close: '23:00' },
        friday: { open: '11:00', close: '23:00' },
        saturday: { open: '10:00', close: '23:00' },
        sunday: { open: '10:00', close: '21:00' }
      }),
      timezone: 'America/New_York',
      currency: 'USD',
      is_active: true,
      owner_id: adminUser.id
    }
  ]).returning('*');

  // Seed Tables
  await knex('tables').insert([
    {
      id: knex.fn.uuid(),
      restaurant_id: restaurant.id,
      number: 'T001',
      capacity: 2,
      status: 'available',
      location: 'Main Hall',
      position: JSON.stringify({ x: 100, y: 100 })
    },
    {
      id: knex.fn.uuid(),
      restaurant_id: restaurant.id,
      number: 'T002',
      capacity: 4,
      status: 'available',
      location: 'Main Hall',
      position: JSON.stringify({ x: 200, y: 100 })
    },
    {
      id: knex.fn.uuid(),
      restaurant_id: restaurant.id,
      number: 'T003',
      capacity: 6,
      status: 'available',
      location: 'Main Hall',
      position: JSON.stringify({ x: 300, y: 100 })
    },
    {
      id: knex.fn.uuid(),
      restaurant_id: restaurant.id,
      number: 'P001',
      capacity: 8,
      status: 'available',
      location: 'Private Room',
      position: JSON.stringify({ x: 100, y: 200 })
    }
  ]);

  // Seed Menu Categories
  const categories = await knex('menu_categories').insert([
    {
      id: knex.fn.uuid(),
      restaurant_id: restaurant.id,
      name: 'Appetizers',
      slug: 'appetizers',
      description: 'Start your meal with our delicious appetizers',
      sort_order: 1
    },
    {
      id: knex.fn.uuid(),
      restaurant_id: restaurant.id,
      name: 'Main Courses',
      slug: 'main-courses',
      description: 'Our signature main dishes',
      sort_order: 2
    },
    {
      id: knex.fn.uuid(),
      restaurant_id: restaurant.id,
      name: 'Desserts',
      slug: 'desserts',
      description: 'Sweet endings to your perfect meal',
      sort_order: 3
    },
    {
      id: knex.fn.uuid(),
      restaurant_id: restaurant.id,
      name: 'Beverages',
      slug: 'beverages',
      description: 'Refreshing drinks and fine wines',
      sort_order: 4
    }
  ]).returning('*');

  // Seed Menu Items
  await knex('menu_items').insert([
    // Appetizers
    {
      id: knex.fn.uuid(),
      restaurant_id: restaurant.id,
      category_id: categories[0].id,
      name: 'Truffle Arancini',
      slug: 'truffle-arancini',
      description: 'Crispy risotto balls filled with truffle and parmesan cheese',
      price: 14.99,
      cost: 6.50,
      allergens: JSON.stringify(['dairy', 'gluten']),
      dietary_info: JSON.stringify(['vegetarian']),
      preparation_time: 15,
      is_available: true,
      is_featured: true
    },
    {
      id: knex.fn.uuid(),
      restaurant_id: restaurant.id,
      category_id: categories[0].id,
      name: 'Pan-Seared Scallops',
      slug: 'pan-seared-scallops',
      description: 'Fresh scallops with cauliflower puree and crispy pancetta',
      price: 18.99,
      cost: 9.50,
      allergens: JSON.stringify(['shellfish']),
      dietary_info: JSON.stringify(['gluten-free']),
      preparation_time: 12,
      is_available: true,
      is_featured: false
    },
    // Main Courses
    {
      id: knex.fn.uuid(),
      restaurant_id: restaurant.id,
      category_id: categories[1].id,
      name: 'Grilled Salmon',
      slug: 'grilled-salmon',
      description: 'Atlantic salmon with lemon herb butter and seasonal vegetables',
      price: 28.99,
      cost: 14.50,
      allergens: JSON.stringify(['fish']),
      dietary_info: JSON.stringify(['gluten-free', 'healthy']),
      preparation_time: 20,
      is_available: true,
      is_featured: true
    },
    {
      id: knex.fn.uuid(),
      restaurant_id: restaurant.id,
      category_id: categories[1].id,
      name: 'Beef Tenderloin',
      slug: 'beef-tenderloin',
      description: 'Premium beef tenderloin with red wine reduction and truffle mash',
      price: 42.99,
      cost: 18.50,
      allergens: JSON.stringify(['dairy']),
      dietary_info: JSON.stringify(['gluten-free']),
      preparation_time: 25,
      is_available: true,
      is_featured: true
    },
    {
      id: knex.fn.uuid(),
      restaurant_id: restaurant.id,
      category_id: categories[1].id,
      name: 'Vegetarian Risotto',
      slug: 'vegetarian-risotto',
      description: 'Creamy mushroom risotto with seasonal vegetables and parmesan',
      price: 22.99,
      cost: 8.50,
      allergens: JSON.stringify(['dairy', 'gluten']),
      dietary_info: JSON.stringify(['vegetarian']),
      preparation_time: 18,
      is_available: true,
      is_featured: false
    },
    // Desserts
    {
      id: knex.fn.uuid(),
      restaurant_id: restaurant.id,
      category_id: categories[2].id,
      name: 'Chocolate Lava Cake',
      slug: 'chocolate-lava-cake',
      description: 'Warm chocolate cake with molten center and vanilla ice cream',
      price: 12.99,
      cost: 4.50,
      allergens: JSON.stringify(['dairy', 'eggs', 'gluten']),
      dietary_info: JSON.stringify(['vegetarian']),
      preparation_time: 8,
      is_available: true,
      is_featured: true
    },
    {
      id: knex.fn.uuid(),
      restaurant_id: restaurant.id,
      category_id: categories[2].id,
      name: 'Tiramisu',
      slug: 'tiramisu',
      description: 'Classic Italian dessert with coffee-soaked ladyfingers and mascarpone',
      price: 9.99,
      cost: 3.50,
      allergens: JSON.stringify(['dairy', 'eggs', 'gluten']),
      dietary_info: JSON.stringify(['vegetarian']),
      preparation_time: 5,
      is_available: true,
      is_featured: false
    },
    // Beverages
    {
      id: knex.fn.uuid(),
      restaurant_id: restaurant.id,
      category_id: categories[3].id,
      name: 'House Wine Selection',
      slug: 'house-wine-selection',
      description: 'Curated selection of red, white, and rosé wines',
      price: 8.99,
      cost: 3.50,
      allergens: JSON.stringify(['sulfites']),
      dietary_info: JSON.stringify(['vegan', 'gluten-free']),
      preparation_time: 2,
      is_available: true,
      is_featured: false
    },
    {
      id: knex.fn.uuid(),
      restaurant_id: restaurant.id,
      category_id: categories[3].id,
      name: 'Craft Beer Selection',
      slug: 'craft-beer-selection',
      description: 'Local and imported craft beer selection',
      price: 6.99,
      cost: 2.50,
      allergens: JSON.stringify(['gluten']),
      dietary_info: JSON.stringify(['vegan']),
      preparation_time: 2,
      is_available: true,
      is_featured: false
    }
  ]);
}