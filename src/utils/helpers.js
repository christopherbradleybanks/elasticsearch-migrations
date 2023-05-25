const config = require(`./config`)
const path = require(`path`)
const fs = require(`fs`)
const {migrationsDir} = config

async function runMigration(client, migrationName, direction) {
    // Load the migration file
    const migration = require(path.join(config.migrationsDir, migrationName));
  
    // Run the migration
    await migration[direction](client);
  }

async function addMigrationToIndex(client, migration, batchId, direction) {
const doc = {
    name: migration,
    action: direction,
    timestamp: new Date(),
    batch: batchId,
};

await client.index({
    index: 'migration_history',
    id: migration,
    body: doc,
    refresh: 'true', // refresh the index after the operation
    op_type: 'index',
});
}

async function getMigrationsFromIndex(client, action) {
    const { hits: {hits} } = await client.search({
      index: 'migration_history',
      body: {
        query: {
          match: {
            action: action
          }
        },
      }
    });
  
    return hits.map(hit => hit._source.name);
  }

async function rollbackBatch(client, batchId) {
const { body } = await client.search({
    index: 'migration_history',
    body: {
    query: {
        match: { batch: batchId }
    },
    sort: [
        { timestamp: 'desc' }
    ]
    }
});

// Reverse the order to rollback the latest migrations first
const migrations = body.hits.hits.reverse();

for (let migration of migrations) {
    const oppositeAction = migration._source.action === 'up' ? 'down' : 'up';

    try {
    // Run the migration
    await runMigration(client, migration._source.name, oppositeAction);

    // Upsert the migration in the index with opposite action
    await addMigrationToIndex(client, migration._source.name, batchId, oppositeAction);
    } catch (err) {
    console.error(`Failed to rollback migration: ${migration._source.name}`, err);
    throw err;
    }
}
}

function getMigrationsFromDirectory() {
  const files = fs.readdirSync(migrationsDir);
  const migrationFiles = files.filter(file => path.extname(file) === '.js');

  // Sort migration files in chronological order (by filename)
  migrationFiles.sort();

  return migrationFiles;
}
async function processMigrations(newMigrations, direction, client) {
   // If there are no new migrations, return
   if (newMigrations.length === 0) {
    return {
      message: `No new migrations to run.`
    };
  }
  const batchId = path.parse(newMigrations[0]).name;

  console.log(`batchId`, batchId);

  // Run each migration in sequence
  for (let migrationFile of newMigrations) {
    const migrationName = path.parse(migrationFile).name;
    console.log(`Running migration: ${migrationName}`);

    try {
      // Run the migration
      await runMigration(client, migrationName, direction);

      // Add migration to index
      await addMigrationToIndex(client, migrationName, batchId, direction);

      console.log(`Migration completed: ${migrationName}`);
    } catch (err) {
      console.error(`Migration failed: ${migrationName}`, err);

      // Rollback the previous migrations
      await rollbackBatch(client, batchId);

      throw new Error('Latest migration failed. All previous migrations of this batch have been rolled back.');
    }
  }
  return {batchId, migrations: newMigrations};
}

async function getProcessedMigrations(client, direction = `up`) {
  const dirMigrations = getMigrationsFromDirectory();
  const indexMigrations = await getMigrationsFromIndex(client, direction);
  return dirMigrations.filter(file => indexMigrations.includes(path.parse(file).name));
}

async function getPendingMigrations(client, direction = `up`) {
  const dirMigrations = getMigrationsFromDirectory();
  const indexMigrations = await getMigrationsFromIndex(client, direction);

  // Find migrations that exist in the directory but not in the index
  return dirMigrations.filter(file => !indexMigrations.includes(path.parse(file).name));
}
  
module.exports = {
    runMigration,
    addMigrationToIndex,
    getMigrationsFromIndex,
    rollbackBatch,
    getMigrationsFromDirectory,
    processMigrations,
    getPendingMigrations,
    getProcessedMigrations,
}