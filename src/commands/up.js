const path = require('path');
const fs = require('fs');
const FETCH_SIZE = 1
module.exports = async function up(client, until) {
    const migrationsDir = config.migrationsDir;
    const migrations = fs.readdirSync(migrationsDir).filter(file => file.endsWith('.js')).sort();
  for (const migration of migrations) {
    const lastMigration = await client.search({
      index: 'migration_history',
      body: {
        query: {
          match_all: {}
        },
        size: FETCH_SIZE,
        sort: [
          {
            timestamp: {
              order: 'desc'
            }
          }
        ]
      }
    });

    if (lastMigration.body.hits.hits.length && lastMigration.body.hits.hits[0]._source.name >= migration) {
      continue;
    }

    if (until && migration > until) break;
    const { up } = require(path.join(migrationsDir, migration));
    await up(client);
    await client.index({
      index: 'migration_history',
      body: {
        name: migration,
        action: 'up',
        timestamp: new Date().toISOString()
      }
    });
  }
};

