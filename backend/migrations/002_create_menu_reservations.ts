import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Menu Categories
  await knex.schema.createTable('menu_categories', (table) => {
    table.uuid('id').primary().defaultTo(knex.fn.uuid());
    table.uuid('restaurant_id').references('id').inTable('restaurants').onDelete('CASCADE');
    table.string('name').notNullable();
    table.string('slug').notNullable();
    table.text('description');
    table.integer('sort_order').defaultTo(0);
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
    
    // Composite unique constraint
    table.unique(['restaurant_id', 'slug']);
    
    // Indexes
    table.index(['restaurant_id', 'is_active']);
    table.index(['sort_order']);
  });

  // Menu Items
  await knex.schema.createTable('menu_items', (table) => {
    table.uuid('id').primary().defaultTo(knex.fn.uuid());
    table.uuid('restaurant_id').references('id').inTable('restaurants').onDelete('CASCADE');
    table.uuid('category_id').references('id').inTable('menu_categories').onDelete('SET NULL');
    table.string('name').notNullable();
    table.string('slug').notNullable();
    table.text('description');
    table.decimal('price', 10, 2).notNullable();
    table.decimal('cost', 10, 2); // Cost price for profit calculation
    table.string('image_url');
    table.json('allergens'); // ["gluten", "dairy", "nuts"]
    table.json('dietary_info'); // ["vegetarian", "vegan", "gluten-free"]
    table.integer('preparation_time'); // in minutes
    table.boolean('is_available').defaultTo(true);
    table.boolean('is_featured').defaultTo(false);
    table.integer('sort_order').defaultTo(0);
    table.timestamps(true, true);
    
    // Composite unique constraint
    table.unique(['restaurant_id', 'slug']);
    
    // Indexes
    table.index(['restaurant_id', 'is_available']);
    table.index(['category_id']);
    table.index(['is_featured']);
    table.index(['price']);
  });

  // Reservations
  await knex.schema.createTable('reservations', (table) => {
    table.uuid('id').primary().defaultTo(knex.fn.uuid());
    table.uuid('restaurant_id').references('id').inTable('restaurants').onDelete('CASCADE');
    table.uuid('table_id').references('id').inTable('tables').onDelete('SET NULL');
    table.uuid('customer_id').references('id').inTable('users').onDelete('SET NULL');
    table.string('customer_name').notNullable();
    table.string('customer_email').notNullable();
    table.string('customer_phone', 20);
    table.integer('party_size').notNullable();
    table.date('reservation_date').notNullable();
    table.time('reservation_time').notNullable();
    table.enum('status', ['pending', 'confirmed', 'seated', 'completed', 'cancelled', 'no_show']).defaultTo('pending');
    table.text('special_requests');
    table.text('notes'); // Staff notes
    table.timestamp('confirmed_at');
    table.uuid('confirmed_by').references('id').inTable('users').onDelete('SET NULL');
    table.timestamps(true, true);
    
    // Indexes
    table.index(['restaurant_id', 'reservation_date']);
    table.index(['table_id', 'reservation_date', 'reservation_time']);
    table.index(['customer_email']);
    table.index(['status']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('reservations');
  await knex.schema.dropTableIfExists('menu_items');
  await knex.schema.dropTableIfExists('menu_categories');
}