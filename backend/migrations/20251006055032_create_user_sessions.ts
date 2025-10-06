import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  // Create user_sessions table for JWT token management
  await knex.schema.createTable('user_sessions', (table) => {
    // Primary key
    table.string('id', 36).primary().defaultTo(knex.raw("(lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6))))"));
    
    // Foreign key to users table
    table.string('user_id', 36).notNullable();
    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
    
    // JWT token information
    table.text('token_hash').notNullable().comment('SHA256 hash of JWT token for revocation');
    table.text('refresh_token_hash').nullable().comment('SHA256 hash of refresh token');
    
    // Session metadata
    table.string('device_info').nullable().comment('User agent or device identifier');
    table.string('ip_address', 45).nullable().comment('IP address (supports IPv6)');
    table.string('session_type').defaultTo('web').comment('web, mobile, api');
    
    // Session status
    table.boolean('is_active').defaultTo(true);
    table.boolean('is_revoked').defaultTo(false);
    table.datetime('revoked_at').nullable();
    table.string('revoked_reason').nullable();
    
    // Timestamps
    table.datetime('expires_at').notNullable().comment('JWT expiration time');
    table.datetime('last_activity').defaultTo(knex.fn.now());
    table.datetime('created_at').notNullable().defaultTo(knex.fn.now());
    table.datetime('updated_at').notNullable().defaultTo(knex.fn.now());
    
    // Indexes for performance
    table.index(['user_id'], 'user_sessions_user_id_index');
    table.index(['token_hash'], 'user_sessions_token_hash_index');
    table.index(['is_active', 'expires_at'], 'user_sessions_active_expires_index');
    table.index(['created_at'], 'user_sessions_created_at_index');
  });

  console.log('✅ Created user_sessions table');
}


export async function down(knex: Knex): Promise<void> {
  // Drop user_sessions table
  await knex.schema.dropTableIfExists('user_sessions');
  console.log('✅ Dropped user_sessions table');
}

