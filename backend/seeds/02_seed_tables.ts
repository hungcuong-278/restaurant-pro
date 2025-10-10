import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Check if tables already exist
  const existingTables = await knex('tables').select('*');
  
  if (existingTables.length > 0) {
    console.log(`✅ Tables already exist (${existingTables.length} tables)`);
    return;
  }

  console.log('🔨 Creating restaurant tables...');

  // Insert tables
  const tables = [
    // Window tables (2 seats)
    { table_number: 'W1', capacity: 2, location: 'window', status: 'available' },
    { table_number: 'W2', capacity: 2, location: 'window', status: 'available' },
    { table_number: 'W3', capacity: 2, location: 'window', status: 'available' },
    
    // Indoor tables (4 seats)
    { table_number: 'T1', capacity: 4, location: 'indoor', status: 'available' },
    { table_number: 'T2', capacity: 4, location: 'indoor', status: 'available' },
    { table_number: 'T3', capacity: 4, location: 'indoor', status: 'available' },
    { table_number: 'T4', capacity: 4, location: 'indoor', status: 'available' },
    { table_number: 'T5', capacity: 4, location: 'indoor', status: 'available' },
    
    // Large tables (6 seats)
    { table_number: 'L1', capacity: 6, location: 'indoor', status: 'available' },
    { table_number: 'L2', capacity: 6, location: 'indoor', status: 'available' },
    
    // VIP tables (8 seats)
    { table_number: 'V1', capacity: 8, location: 'vip', status: 'available' },
    { table_number: 'V2', capacity: 8, location: 'vip', status: 'available' },
    
    // Outdoor patio (4 seats)
    { table_number: 'P1', capacity: 4, location: 'outdoor', status: 'available' },
    { table_number: 'P2', capacity: 4, location: 'outdoor', status: 'available' },
    { table_number: 'P3', capacity: 4, location: 'outdoor', status: 'available' },
  ];

  for (const table of tables) {
    await knex('tables').insert(table);
    console.log(`✅ Created table: ${table.table_number} (${table.capacity} seats, ${table.location})`);
  }

  console.log(`✅ Successfully created ${tables.length} tables!`);
}
