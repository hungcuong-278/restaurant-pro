import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  console.log('🏷️  Updating table names with professional names...');

  // Update table location to professional, elegant names
  // Using 'location' field since 'name' column doesn't exist
  const updates = [
    { number: 'P001', location: 'Le Château' },
    { number: 'T001', location: 'Roma Intima' },
    { number: 'T002', location: 'The Velvet Rose' },
    { number: 'T003', location: 'The Windsor Room' }
  ];

  for (const update of updates) {
    const result = await knex('tables')
      .where({ number: update.number })
      .update({
        location: update.location,
        updated_at: knex.fn.now()
      });

    if (result) {
      console.log(`✅ Updated table ${update.number}: "${update.location}"`);
    } else {
      console.log(`⚠️  Table ${update.number} not found, skipping...`);
    }
  }

  console.log('🎉 Table names updated successfully!');
  console.log('📋 Professional table names:');
  console.log('   • P001: Le Château (Private Room)');
  console.log('   • T001: Roma Intima');
  console.log('   • T002: The Velvet Rose');
  console.log('   • T003: The Windsor Room');
}
