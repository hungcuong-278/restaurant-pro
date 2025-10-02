import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Orders table - POS System
  await knex.schema.createTable('orders', (table) => {
    table.uuid('id').primary().defaultTo(knex.fn.uuid());
    table.uuid('restaurant_id').references('id').inTable('restaurants').onDelete('CASCADE');
    table.uuid('table_id').references('id').inTable('tables').onDelete('SET NULL');
    table.uuid('customer_id').references('id').inTable('users').onDelete('SET NULL');
    table.uuid('staff_id').references('id').inTable('users').onDelete('SET NULL');
    table.string('order_number').unique().notNullable(); // ORD-20231103-001
    table.enum('order_type', ['dine_in', 'takeout', 'delivery']).defaultTo('dine_in');
    table.enum('status', ['pending', 'confirmed', 'preparing', 'ready', 'served', 'completed', 'cancelled']).defaultTo('pending');
    table.decimal('subtotal', 10, 2).notNullable().defaultTo(0);
    table.decimal('tax_amount', 10, 2).notNullable().defaultTo(0);
    table.decimal('discount_amount', 10, 2).notNullable().defaultTo(0);
    table.decimal('tip_amount', 10, 2).notNullable().defaultTo(0);
    table.decimal('total_amount', 10, 2).notNullable().defaultTo(0);
    table.string('discount_reason');
    table.text('customer_notes');
    table.text('kitchen_notes');
    table.timestamp('ordered_at').defaultTo(knex.fn.now());
    table.timestamp('confirmed_at');
    table.timestamp('ready_at');
    table.timestamp('served_at');
    table.timestamp('completed_at');
    table.timestamps(true, true);
    
    // Indexes
    table.index(['restaurant_id', 'status']);
    table.index(['table_id', 'status']);
    table.index(['order_number']);
    table.index(['ordered_at']);
    table.index(['staff_id']);
  });

  // Order Items
  await knex.schema.createTable('order_items', (table) => {
    table.uuid('id').primary().defaultTo(knex.fn.uuid());
    table.uuid('order_id').references('id').inTable('orders').onDelete('CASCADE');
    table.uuid('menu_item_id').references('id').inTable('menu_items').onDelete('RESTRICT');
    table.string('item_name').notNullable(); // Snapshot of item name at order time
    table.decimal('item_price', 10, 2).notNullable(); // Snapshot of price at order time
    table.integer('quantity').notNullable().defaultTo(1);
    table.decimal('total_price', 10, 2).notNullable();
    table.text('special_instructions');
    table.enum('status', ['ordered', 'preparing', 'ready', 'served']).defaultTo('ordered');
    table.timestamps(true, true);
    
    // Indexes
    table.index(['order_id']);
    table.index(['menu_item_id']);
    table.index(['status']);
  });

  // Payments
  await knex.schema.createTable('payments', (table) => {
    table.uuid('id').primary().defaultTo(knex.fn.uuid());
    table.uuid('order_id').references('id').inTable('orders').onDelete('CASCADE');
    table.uuid('processed_by').references('id').inTable('users').onDelete('SET NULL');
    table.string('payment_method').notNullable(); // cash, card, mobile, split
    table.decimal('amount', 10, 2).notNullable();
    table.enum('status', ['pending', 'completed', 'failed', 'refunded']).defaultTo('pending');
    table.string('transaction_id'); // For card payments
    table.json('payment_details'); // Store additional payment info
    table.timestamp('processed_at').defaultTo(knex.fn.now());
    table.timestamps(true, true);
    
    // Indexes
    table.index(['order_id']);
    table.index(['payment_method']);
    table.index(['status']);
    table.index(['processed_at']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('payments');
  await knex.schema.dropTableIfExists('order_items');
  await knex.schema.dropTableIfExists('orders');
}