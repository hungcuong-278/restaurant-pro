import { Knex } from 'knex';

/**
 * Migration: Add payment tracking columns to orders table
 * Week 7 - Phase 2
 */
export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('orders', (table) => {
    // Add payment status tracking
    table.enum('payment_status', ['unpaid', 'partial', 'paid', 'refunded'])
      .defaultTo('unpaid')
      .after('status');
    
    // Add paid timestamp
    table.timestamp('paid_at').nullable().after('completed_at');
    
    // Add index for payment_status
    table.index(['payment_status']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('orders', (table) => {
    table.dropColumn('payment_status');
    table.dropColumn('paid_at');
  });
}
