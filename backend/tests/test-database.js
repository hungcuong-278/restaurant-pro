// Simple database test
const path = require('path');
process.chdir('d:\\First\\backend');

const knex = require('knex');
const knexConfig = require('./knexfile.ts').default;

const db = knex(knexConfig.development);

async function testDatabase() {
  try {
    console.log('Testing database connection...');
    
    // Test basic connection
    const result = await db.raw('SELECT 1 as test');
    console.log('✅ Database connected:', result);
    
    // Check if tables exist
    const tables = await db.raw("SELECT name FROM sqlite_master WHERE type='table'");
    console.log('📋 Available tables:', tables.map(t => t.name));
    
    // Test tables table
    const tableCount = await db('tables').count('id as count').first();
    console.log('🪑 Tables count:', tableCount);
    
    // Test reservations table
    const reservationCount = await db('reservations').count('id as count').first();
    console.log('📅 Reservations count:', reservationCount);
    
    await db.destroy();
    console.log('✅ Database test completed successfully');
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
    await db.destroy();
  }
}

testDatabase();