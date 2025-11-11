import { Knex } from 'knex';
import { v4 as uuidv4 } from 'uuid';

export async function seed(knex: Knex): Promise<void> {
  // Clear existing orders and order_items
  await knex('order_items').del();
  await knex('orders').del();

  // Get restaurant, tables, and menu items
  const restaurant = await knex('restaurants').first();
  if (!restaurant) {
    console.log('No restaurant found. Please run 01_seed_initial_data first.');
    return;
  }

  const tables = await knex('tables').where({ restaurant_id: restaurant.id }).limit(3);
  const menuItems = await knex('menu_items').select('*').limit(10);
  
  if (menuItems.length === 0) {
    console.log('No menu items found. Please run 02_seed_european_menu first.');
    return;
  }

  // Helper to generate order number
  const generateOrderNumber = (index: number) => {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    return `ORD-${dateStr}-${String(index).padStart(3, '0')}`;
  };

  // Create sample orders with items
  const ordersData = [
    {
      id: uuidv4(),
      restaurant_id: restaurant.id,
      table_id: tables[0]?.id || null,
      order_number: generateOrderNumber(1),
      order_type: 'dine_in',
      status: 'completed',
      payment_status: 'paid',
      items: [
        { menu_item_id: menuItems[0].id, quantity: 2 },
        { menu_item_id: menuItems[1].id, quantity: 1 }
      ]
    },
    {
      id: uuidv4(),
      restaurant_id: restaurant.id,
      table_id: tables[1]?.id || null,
      order_number: generateOrderNumber(2),
      order_type: 'dine_in',
      status: 'served',
      payment_status: 'unpaid',
      items: [
        { menu_item_id: menuItems[2].id, quantity: 1 },
        { menu_item_id: menuItems[3].id, quantity: 3 },
        { menu_item_id: menuItems[4].id, quantity: 2 }
      ]
    },
    {
      id: uuidv4(),
      restaurant_id: restaurant.id,
      table_id: tables[2]?.id || null,
      order_number: generateOrderNumber(3),
      order_type: 'dine_in',
      status: 'preparing',
      payment_status: 'unpaid',
      items: [
        { menu_item_id: menuItems[5].id, quantity: 4 },
        { menu_item_id: menuItems[6].id, quantity: 2 }
      ]
    },
    {
      id: uuidv4(),
      restaurant_id: restaurant.id,
      order_number: generateOrderNumber(4),
      order_type: 'takeout',
      status: 'ready',
      payment_status: 'paid',
      items: [
        { menu_item_id: menuItems[7].id, quantity: 1 },
        { menu_item_id: menuItems[8].id, quantity: 1 }
      ]
    },
    {
      id: uuidv4(),
      restaurant_id: restaurant.id,
      order_number: generateOrderNumber(5),
      order_type: 'delivery',
      status: 'pending',
      payment_status: 'unpaid',
      items: [
        { menu_item_id: menuItems[0].id, quantity: 1 },
        { menu_item_id: menuItems[2].id, quantity: 2 },
        { menu_item_id: menuItems[4].id, quantity: 1 }
      ]
    }
  ];

  // Insert orders and their items
  for (const orderData of ordersData) {
    const { items, ...orderFields } = orderData;
    
    // Calculate totals
    let subtotal = 0;
    for (const item of items) {
      const menuItem = menuItems.find(mi => mi.id === item.menu_item_id);
      if (menuItem) {
        subtotal += menuItem.price * item.quantity;
      }
    }
    
    const tax_amount = subtotal * 0.085; // 8.5% tax
    const total_amount = subtotal + tax_amount;
    
    // Insert order with pre-generated ID
    await knex('orders').insert({
      ...orderFields,
      subtotal,
      tax_amount,
      discount_amount: 0,
      tip_amount: 0,
      total_amount,
      ordered_at: Date.now(),
      paid_at: orderFields.payment_status === 'paid' ? Date.now() : null
    });

    // Insert order items using the pre-generated order ID
    for (const item of items) {
      const menuItem = menuItems.find(mi => mi.id === item.menu_item_id);
      if (menuItem) {
        await knex('order_items').insert({
          id: uuidv4(),
          order_id: orderFields.id,
          menu_item_id: item.menu_item_id,
          item_name: menuItem.name,
          item_price: menuItem.price,
          quantity: item.quantity,
          total_price: menuItem.price * item.quantity,
          status: 'ordered'
        });
      }
    }
  }

  console.log('✓ Seeded 5 orders with items');
}
