const path = require('path');
const config = require('../utils/config');

module.exports = async function down(client, until) {
  const migrationsDir = config.migrationsDir;
  const migrations = fs.readdirSync(migrationsDir).filter(file => file.endsWith('.js')).sort().reverse();
  for (const migration of migrations) {
    const lastMigration = await client.search({
      index: 'migration_history',
      body: {
        query: {
          match: {
            name: migration
          }
        }
      }
    });

    if (!lastMigration.body.hits.hits.length || lastMigration.body.hits.hits[0]._source.action !== 'up') {
      continue;
    }

    if (until && migration < until) break;
    const { down } = require(path.join(migrationsDir, migration));
    await down(client);
    await client.index({
      index: 'migration_history',
      body: {
        name: migration,
        action: 'down',
        timestamp: new Date().toISOString()
      }
    });
  }
};
