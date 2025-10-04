import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Get restaurant and categories
  const restaurant = await knex('restaurants').where('slug', 'golden-fork').first();
  
  if (!restaurant) {
    console.log('Restaurant not found. Please run 01_seed_initial_data first.');
    return;
  }

  // Get or create categories
  let categories = await knex('menu_categories')
    .where('restaurant_id', restaurant.id)
    .orderBy('sort_order', 'asc');

  // Create new categories if they don't exist
  const categoryMap: { [key: string]: any } = {};
  
  for (const cat of categories) {
    categoryMap[cat.slug] = cat;
  }

  // Add Salads category if not exists
  if (!categoryMap['salads']) {
    const [saladCategory] = await knex('menu_categories').insert([
      {
        id: knex.fn.uuid(),
        restaurant_id: restaurant.id,
        name: 'Salads',
        slug: 'salads',
        description: 'Fresh salads and appetizers',
        sort_order: 2,
        is_active: true
      }
    ]).returning('*');
    categoryMap['salads'] = saladCategory;
  }

  // Add Pasta & Risotto category if not exists
  if (!categoryMap['pasta-risotto']) {
    const [pastaCategory] = await knex('menu_categories').insert([
      {
        id: knex.fn.uuid(),
        restaurant_id: restaurant.id,
        name: 'Pasta & Risotto',
        slug: 'pasta-risotto',
        description: 'Italian pasta and risotto dishes',
        sort_order: 3,
        is_active: true
      }
    ]).returning('*');
    categoryMap['pasta-risotto'] = pastaCategory;
  }

  // Update sort orders if needed
  await knex('menu_categories')
    .where('restaurant_id', restaurant.id)
    .where('slug', 'main-courses')
    .update({ sort_order: 4 });

  await knex('menu_categories')
    .where('restaurant_id', restaurant.id)
    .where('slug', 'desserts')
    .update({ sort_order: 5 });

  await knex('menu_categories')
    .where('restaurant_id', restaurant.id)
    .where('slug', 'beverages')
    .update({ sort_order: 6 });

  // Refresh categories
  categories = await knex('menu_categories')
    .where('restaurant_id', restaurant.id)
    .orderBy('sort_order', 'asc');

  for (const cat of categories) {
    categoryMap[cat.slug] = cat;
  }

  // Seed European Menu Items
  await knex('menu_items').insert([
    // ====== KHAI VỊ & SALAD ======
    {
      id: knex.fn.uuid(),
      restaurant_id: restaurant.id,
      category_id: categoryMap['appetizers'].id,
      name: 'Caesar Salad',
      slug: 'caesar-salad',
      description: 'Romaine lettuce, parmesan, croutons, anchovies',
      price: 12.99,
      cost: 4.50,
      allergens: JSON.stringify(['dairy', 'gluten', 'fish']),
      dietary_info: JSON.stringify([]),
      preparation_time: 10,
      is_available: true,
      is_featured: false,
      sort_order: 1
    },
    {
      id: knex.fn.uuid(),
      restaurant_id: restaurant.id,
      category_id: categoryMap['salads'].id,
      name: 'Caprese Salad',
      slug: 'caprese-salad',
      description: 'Fresh mozzarella, tomato, basil, olive oil',
      price: 11.99,
      cost: 5.00,
      allergens: JSON.stringify(['dairy']),
      dietary_info: JSON.stringify(['vegetarian', 'gluten-free']),
      preparation_time: 8,
      is_available: true,
      is_featured: true,
      sort_order: 2
    },
    {
      id: knex.fn.uuid(),
      restaurant_id: restaurant.id,
      category_id: categoryMap['appetizers'].id,
      name: 'Escargot à la Bourguignonne',
      slug: 'escargot-bourguignonne',
      description: 'Snails, garlic butter, parsley',
      price: 16.99,
      cost: 7.50,
      allergens: JSON.stringify(['dairy', 'shellfish']),
      dietary_info: JSON.stringify(['gluten-free']),
      preparation_time: 15,
      is_available: true,
      is_featured: true,
      sort_order: 3
    },
    {
      id: knex.fn.uuid(),
      restaurant_id: restaurant.id,
      category_id: categoryMap['appetizers'].id,
      name: 'Smoked Salmon Tartare',
      slug: 'smoked-salmon-tartare',
      description: 'Smoked salmon, capers, shallots, lemon',
      price: 18.99,
      cost: 9.00,
      allergens: JSON.stringify(['fish']),
      dietary_info: JSON.stringify(['gluten-free']),
      preparation_time: 12,
      is_available: true,
      is_featured: true,
      sort_order: 4
    },
    {
      id: knex.fn.uuid(),
      restaurant_id: restaurant.id,
      category_id: categoryMap['appetizers'].id,
      name: 'French Onion Soup',
      slug: 'french-onion-soup',
      description: 'Caramelized onions, beef stock, gruyère cheese',
      price: 13.99,
      cost: 5.50,
      allergens: JSON.stringify(['dairy', 'gluten']),
      dietary_info: JSON.stringify([]),
      preparation_time: 10,
      is_available: true,
      is_featured: false,
      sort_order: 5
    },

    // ====== MÓN CHÍNH (MEAT & FISH) ======
    {
      id: knex.fn.uuid(),
      restaurant_id: restaurant.id,
      category_id: categoryMap['main-courses'].id,
      name: 'Beef Wellington',
      slug: 'beef-wellington',
      description: 'Beef tenderloin, mushroom duxelles, puff pastry',
      price: 58.99,
      cost: 24.00,
      allergens: JSON.stringify(['gluten', 'dairy', 'eggs']),
      dietary_info: JSON.stringify([]),
      preparation_time: 35,
      is_available: true,
      is_featured: true,
      sort_order: 1
    },
    {
      id: knex.fn.uuid(),
      restaurant_id: restaurant.id,
      category_id: categoryMap['main-courses'].id,
      name: 'Duck à l\'Orange',
      slug: 'duck-orange',
      description: 'Duck, orange, sugar, vinegar, stock',
      price: 45.99,
      cost: 19.00,
      allergens: JSON.stringify([]),
      dietary_info: JSON.stringify(['gluten-free']),
      preparation_time: 30,
      is_available: true,
      is_featured: true,
      sort_order: 2
    },
    {
      id: knex.fn.uuid(),
      restaurant_id: restaurant.id,
      category_id: categoryMap['main-courses'].id,
      name: 'Steak au Poivre',
      slug: 'steak-au-poivre',
      description: 'Filet mignon, black peppercorns, cognac, cream',
      price: 52.99,
      cost: 22.00,
      allergens: JSON.stringify(['dairy', 'alcohol']),
      dietary_info: JSON.stringify(['gluten-free']),
      preparation_time: 25,
      is_available: true,
      is_featured: true,
      sort_order: 3
    },
    {
      id: knex.fn.uuid(),
      restaurant_id: restaurant.id,
      category_id: categoryMap['main-courses'].id,
      name: 'Lamb Rack Provençal',
      slug: 'lamb-rack-provencal',
      description: 'Lamb, rosemary, thyme, garlic',
      price: 48.99,
      cost: 20.00,
      allergens: JSON.stringify([]),
      dietary_info: JSON.stringify(['gluten-free']),
      preparation_time: 28,
      is_available: true,
      is_featured: false,
      sort_order: 4
    },
    {
      id: knex.fn.uuid(),
      restaurant_id: restaurant.id,
      category_id: categoryMap['main-courses'].id,
      name: 'Coq au Vin',
      slug: 'coq-au-vin',
      description: 'Chicken, red wine, mushrooms, pearl onions',
      price: 38.99,
      cost: 15.00,
      allergens: JSON.stringify(['alcohol']),
      dietary_info: JSON.stringify(['gluten-free']),
      preparation_time: 35,
      is_available: true,
      is_featured: false,
      sort_order: 5
    },
    {
      id: knex.fn.uuid(),
      restaurant_id: restaurant.id,
      category_id: categoryMap['main-courses'].id,
      name: 'Bouillabaisse',
      slug: 'bouillabaisse',
      description: 'Mixed seafood (fish, mussels, shrimp), saffron, fennel',
      price: 46.99,
      cost: 21.00,
      allergens: JSON.stringify(['fish', 'shellfish']),
      dietary_info: JSON.stringify(['gluten-free']),
      preparation_time: 30,
      is_available: true,
      is_featured: true,
      sort_order: 6
    },
    {
      id: knex.fn.uuid(),
      restaurant_id: restaurant.id,
      category_id: categoryMap['main-courses'].id,
      name: 'Paella Valenciana',
      slug: 'paella-valenciana',
      description: 'Saffron rice, shrimp, mussels, chorizo, chicken',
      price: 42.99,
      cost: 18.00,
      allergens: JSON.stringify(['shellfish', 'gluten']),
      dietary_info: JSON.stringify([]),
      preparation_time: 40,
      is_available: true,
      is_featured: true,
      sort_order: 7
    },
    {
      id: knex.fn.uuid(),
      restaurant_id: restaurant.id,
      category_id: categoryMap['main-courses'].id,
      name: 'Moussaka',
      slug: 'moussaka',
      description: 'Eggplant, ground lamb, béchamel',
      price: 34.99,
      cost: 14.00,
      allergens: JSON.stringify(['dairy', 'gluten']),
      dietary_info: JSON.stringify([]),
      preparation_time: 32,
      is_available: true,
      is_featured: false,
      sort_order: 8
    },
    {
      id: knex.fn.uuid(),
      restaurant_id: restaurant.id,
      category_id: categoryMap['main-courses'].id,
      name: 'Ratatouille',
      slug: 'ratatouille',
      description: 'Zucchini, eggplant, bell peppers, tomato',
      price: 28.99,
      cost: 10.00,
      allergens: JSON.stringify([]),
      dietary_info: JSON.stringify(['vegetarian', 'vegan', 'gluten-free']),
      preparation_time: 25,
      is_available: true,
      is_featured: false,
      sort_order: 9
    },
    {
      id: knex.fn.uuid(),
      restaurant_id: restaurant.id,
      category_id: categoryMap['main-courses'].id,
      name: 'Sea Bass à la Meunière',
      slug: 'sea-bass-meuniere',
      description: 'Sea bass, butter, lemon, parsley',
      price: 44.99,
      cost: 19.00,
      allergens: JSON.stringify(['fish', 'dairy']),
      dietary_info: JSON.stringify(['gluten-free']),
      preparation_time: 22,
      is_available: true,
      is_featured: true,
      sort_order: 10
    },

    // ====== PASTA & RISOTTO ======
    {
      id: knex.fn.uuid(),
      restaurant_id: restaurant.id,
      category_id: categoryMap['pasta-risotto'].id,
      name: 'Spaghetti Carbonara',
      slug: 'spaghetti-carbonara',
      description: 'Pasta, egg yolk, pecorino, guanciale',
      price: 24.99,
      cost: 8.00,
      allergens: JSON.stringify(['gluten', 'dairy', 'eggs']),
      dietary_info: JSON.stringify([]),
      preparation_time: 18,
      is_available: true,
      is_featured: true,
      sort_order: 1
    },
    {
      id: knex.fn.uuid(),
      restaurant_id: restaurant.id,
      category_id: categoryMap['pasta-risotto'].id,
      name: 'Risotto alla Milanese',
      slug: 'risotto-milanese',
      description: 'Arborio rice, saffron, parmesan',
      price: 26.99,
      cost: 9.00,
      allergens: JSON.stringify(['dairy']),
      dietary_info: JSON.stringify(['vegetarian', 'gluten-free']),
      preparation_time: 22,
      is_available: true,
      is_featured: true,
      sort_order: 2
    },
    {
      id: knex.fn.uuid(),
      restaurant_id: restaurant.id,
      category_id: categoryMap['pasta-risotto'].id,
      name: 'Lasagna al Forno',
      slug: 'lasagna-forno',
      description: 'Pasta sheets, ragu, béchamel, mozzarella',
      price: 28.99,
      cost: 11.00,
      allergens: JSON.stringify(['gluten', 'dairy', 'eggs']),
      dietary_info: JSON.stringify([]),
      preparation_time: 25,
      is_available: true,
      is_featured: false,
      sort_order: 3
    },

    // ====== TRÁNG MIỆNG ======
    {
      id: knex.fn.uuid(),
      restaurant_id: restaurant.id,
      category_id: categoryMap['desserts'].id,
      name: 'Tiramisu Classic',
      slug: 'tiramisu-classic',
      description: 'Mascarpone, espresso, ladyfingers, cocoa',
      price: 10.99,
      cost: 4.00,
      allergens: JSON.stringify(['dairy', 'eggs', 'gluten', 'caffeine']),
      dietary_info: JSON.stringify(['vegetarian']),
      preparation_time: 5,
      is_available: true,
      is_featured: true,
      sort_order: 1
    },
    {
      id: knex.fn.uuid(),
      restaurant_id: restaurant.id,
      category_id: categoryMap['desserts'].id,
      name: 'Crème Brûlée',
      slug: 'creme-brulee',
      description: 'Cream, egg yolks, sugar, vanilla',
      price: 11.99,
      cost: 4.50,
      allergens: JSON.stringify(['dairy', 'eggs']),
      dietary_info: JSON.stringify(['vegetarian', 'gluten-free']),
      preparation_time: 8,
      is_available: true,
      is_featured: true,
      sort_order: 2
    }
  ]);

  console.log('✅ European menu items seeded successfully!');
  console.log('📋 Added 22 new menu items across 5 categories');
}
