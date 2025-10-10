import { Knex } from 'knex';
import bcrypt from 'bcrypt';

export async function seed(knex: Knex): Promise<void> {
  // Don't delete existing users, just add test users if they don't exist
  
  // Hash passwords
  const hashedPassword = await bcrypt.hash('password123', 10);
  const hashedAdminPassword = await bcrypt.hash('admin123', 10);

  // Check and insert admin user
  const adminExists = await knex('users').where({ email: 'admin@restaurant.com' }).first();
  if (!adminExists) {
    await knex('users').insert({
      email: 'admin@restaurant.com',
      password_hash: hashedAdminPassword,
      first_name: 'Admin',
      last_name: 'User',
      role: 'admin',
      phone: '0901234567'
    });
    console.log('✅ Admin user created');
  } else {
    console.log('ℹ️  Admin user already exists');
  }

  // Check and insert test customer
  const customerExists = await knex('users').where({ email: 'customer@test.com' }).first();
  if (!customerExists) {
    await knex('users').insert({
      email: 'customer@test.com',
      password_hash: hashedPassword,
      first_name: 'Test',
      last_name: 'Customer',
      role: 'customer',
      phone: '0987654321'
    });
    console.log('✅ Test customer created');
  } else {
    console.log('ℹ️  Test customer already exists');
  }

  // Check and insert john doe
  const johnExists = await knex('users').where({ email: 'john@example.com' }).first();
  if (!johnExists) {
    await knex('users').insert({
      email: 'john@example.com',
      password_hash: hashedPassword,
      first_name: 'John',
      last_name: 'Doe',
      role: 'customer',
      phone: '0912345678'
    });
    console.log('✅ John Doe user created');
  } else {
    console.log('ℹ️  John Doe user already exists');
  }

  console.log('✅ User seed completed successfully');
}
