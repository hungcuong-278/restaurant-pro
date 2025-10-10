const knex = require('knex');
const db = knex({
  client: 'sqlite3',
  connection: { filename: './database/dev.sqlite3' },
  useNullAsDefault: true
});

db.raw('PRAGMA table_info(orders)')
  .then(result => {
    console.log('Orders table schema:');
    result.forEach(col => {
      console.log(`  ${col.name}: ${col.type}${col.pk ? ' (PRIMARY KEY)' : ''}`);
    });
  })
  .finally(() => db.destroy());
