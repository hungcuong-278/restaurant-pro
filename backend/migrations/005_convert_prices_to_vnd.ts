import type { Knex } from 'knex';

/**
 * Migration: Convert all prices from USD to VND
 * Exchange rate: 1 USD = 25,000 VND
 * 
 * This migration updates:
 * - menu_items: price, cost
 * - orders: subtotal, tax_amount, discount_amount, tip_amount, total_amount
 * - order_items: item_price, total_price
 * - payments: amount
 */

export async function up(knex: Knex): Promise<void> {
  const EXCHANGE_RATE = 25000;

  console.log('🔄 Converting prices from USD to VND...');

  // Update menu_items prices
  await knex.raw(`
    UPDATE menu_items 
    SET 
      price = ROUND(price * ${EXCHANGE_RATE}),
      cost = ROUND(cost * ${EXCHANGE_RATE})
  `);
  console.log('✅ Menu items prices converted');

  // Update orders amounts
  await knex.raw(`
    UPDATE orders 
    SET 
      subtotal = ROUND(subtotal * ${EXCHANGE_RATE}),
      tax_amount = ROUND(tax_amount * ${EXCHANGE_RATE}),
      discount_amount = ROUND(discount_amount * ${EXCHANGE_RATE}),
      tip_amount = ROUND(tip_amount * ${EXCHANGE_RATE}),
      total_amount = ROUND(total_amount * ${EXCHANGE_RATE})
  `);
  console.log('✅ Orders amounts converted');

  // Update order_items prices
  await knex.raw(`
    UPDATE order_items 
    SET 
      item_price = ROUND(item_price * ${EXCHANGE_RATE}),
      total_price = ROUND(total_price * ${EXCHANGE_RATE})
  `);
  console.log('✅ Order items prices converted');

  // Update payments amounts (if table exists)
  const hasPaymentsTable = await knex.schema.hasTable('payments');
  if (hasPaymentsTable) {
    await knex.raw(`
      UPDATE payments 
      SET amount = ROUND(amount * ${EXCHANGE_RATE})
    `);
    console.log('✅ Payments amounts converted');
  }

  console.log('🎉 All prices converted to VND successfully!');
}

export async function down(knex: Knex): Promise<void> {
  const EXCHANGE_RATE = 25000;

  console.log('🔄 Converting prices from VND back to USD...');

  // Revert menu_items prices
  await knex.raw(`
    UPDATE menu_items 
    SET 
      price = ROUND(price / ${EXCHANGE_RATE} * 100) / 100,
      cost = ROUND(cost / ${EXCHANGE_RATE} * 100) / 100
  `);

  // Revert orders amounts
  await knex.raw(`
    UPDATE orders 
    SET 
      subtotal = ROUND(subtotal / ${EXCHANGE_RATE} * 100) / 100,
      tax_amount = ROUND(tax_amount / ${EXCHANGE_RATE} * 100) / 100,
      discount_amount = ROUND(discount_amount / ${EXCHANGE_RATE} * 100) / 100,
      tip_amount = ROUND(tip_amount / ${EXCHANGE_RATE} * 100) / 100,
      total_amount = ROUND(total_amount / ${EXCHANGE_RATE} * 100) / 100
  `);

  // Revert order_items prices
  await knex.raw(`
    UPDATE order_items 
    SET 
      item_price = ROUND(item_price / ${EXCHANGE_RATE} * 100) / 100,
      total_price = ROUND(total_price / ${EXCHANGE_RATE} * 100) / 100
  `);

  // Revert payments amounts (if table exists)
  const hasPaymentsTable = await knex.schema.hasTable('payments');
  if (hasPaymentsTable) {
    await knex.raw(`
      UPDATE payments 
      SET amount = ROUND(amount / ${EXCHANGE_RATE} * 100) / 100
    `);
  }

  console.log('✅ All prices reverted to USD');
}
