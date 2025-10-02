import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Users table - Authentication & Authorization
  await knex.schema.createTable('users', (table) => {
    table.uuid('id').primary().defaultTo(knex.fn.uuid());
    table.string('email').unique().notNullable();
    table.string('password_hash').notNullable();
    table.string('first_name').notNullable();
    table.string('last_name').notNullable();
    table.enum('role', ['admin', 'manager', 'staff', 'customer']).defaultTo('customer');
    table.string('phone', 20);
    table.boolean('is_active').defaultTo(true);
    table.boolean('email_verified').defaultTo(false);
    table.string('reset_password_token');
    table.timestamp('reset_password_expires');
    table.timestamp('last_login');
    table.timestamps(true, true);
    
    // Indexes
    table.index(['email']);
    table.index(['role']);
    table.index(['is_active']);
  });

  // Restaurants table - Multi-restaurant support
  await knex.schema.createTable('restaurants', (table) => {
    table.uuid('id').primary().defaultTo(knex.fn.uuid());
    table.string('name').notNullable();
    table.string('slug').unique().notNullable();
    table.text('description');
    table.string('address').notNullable();
    table.string('phone', 20);
    table.string('email');
    table.string('website');
    table.json('business_hours'); // {monday: {open: "09:00", close: "22:00"}, ...}
    table.string('timezone').defaultTo('UTC');
    table.string('currency').defaultTo('USD');
    table.string('logo_url');
    table.boolean('is_active').defaultTo(true);
    table.uuid('owner_id').references('id').inTable('users').onDelete('CASCADE');
    table.timestamps(true, true);
    
    // Indexes
    table.index(['slug']);
    table.index(['is_active']);
    table.index(['owner_id']);
  });

  // Tables table - Restaurant tables/seating
  await knex.schema.createTable('tables', (table) => {
    table.uuid('id').primary().defaultTo(knex.fn.uuid());
    table.uuid('restaurant_id').references('id').inTable('restaurants').onDelete('CASCADE');
    table.string('number').notNullable(); // T001, T002, etc.
    table.integer('capacity').notNullable();
    table.enum('status', ['available', 'occupied', 'reserved', 'maintenance']).defaultTo('available');
    table.string('location'); // "Main Hall", "Patio", "Private Room"
    table.json('position'); // {x: 100, y: 200} for floor plan
    table.text('notes');
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
    
    // Composite unique constraint
    table.unique(['restaurant_id', 'number']);
    
    // Indexes
    table.index(['restaurant_id', 'status']);
    table.index(['capacity']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('tables');
  await knex.schema.dropTableIfExists('restaurants');
  await knex.schema.dropTableIfExists('users');
}