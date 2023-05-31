const config = require(`./config`);
const path = require(`path`);
const fs = require(`fs`);
const {
  migrationsDir,
  seedsDir,

} = config;
/**
 *
 * @param {*} client
 * @param {*} seedName
 * @param {*} direction
 */
async function runSeed(client, seedName, direction = `up`) {
  // Load the migration file
  const seed = require(path.join(config.seedsDir, seedName));

  // Run the migration
  await seed[direction](client);
}
/**
 *
 * @param {*} client
 * @param {*} seed
 * @param {*} direction
 */
async function addSeedToIndex(client, seed, direction) {
  const doc = {
    name: seed,
    action: direction,
    timestamp: new Date(),
  };

  await client.index({
    index: 'seed_history',
    id: seed,
    body: doc,
    refresh: 'true', // refresh the index after the operation
    op_type: 'index',
  });
}
/**
 *
 * @param {*} client
 * @param {*} migrationName
 * @param {*} direction
 */
async function runMigration(client, migrationName, direction) {
  // Load the migration file
  const migration = require(path.join(config.migrationsDir, migrationName));

  // Run the migration
  await migration[direction](client);
}
/**
 *
 * @param {*} client
 * @param {*} migration
 * @param {*} batchId
 * @param {*} direction
 */
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
/**
 *
 * @param {*} client
 * @param {*} action
 * @param {*} index
 * @return {result}
 */
async function getMigrationsFromIndex(
    client,
    action,
    index = `migration_history`) {
  const {
    hits: {
      hits,
    },
  } = await client.search({
    index,
    body: {
      query: {
        match: {
          action,
        },
      },
    },
  });

  return hits.map((hit) => hit._source.name);
}
/**
 *
 * @param {*} client
 * @param {*} batchId
 * @return {result}
 */
async function getBatchMigrations(client, batchId) {
  let searchQuery;

  if (batchId) {
    // If batchId is specified, return documents matching the batchId
    searchQuery = {
      match: {
        batch: batchId,
      },
    };
  } else {
    // If no batchId, retrieve the last document added,
    // and return documents matching its batchId
    const {
      hits: {
        hits,
      },
    } = await client.search({
      index: 'migration_history',
      body: {
        size: 1,
        sort: [
          {
            timestamp: 'desc',
          },
        ],
      },
    });

    const lastBatchId = hits.length ? hits[0]._source.batch : null;
    if (!lastBatchId) {
      return {
        hits: [], batch: null,
      };
    }
    searchQuery = {
      match: {
        batch: lastBatchId,
      },
    };
  }

  const {
    hits: {
      hits,
    },
  } = await client.search({
    index: 'migration_history',
    body: {
      query: searchQuery,
      sort: [
        {
          timestamp: 'desc',
        },
      ],
    },
  });
  console.log(`search Query`, searchQuery);
  const {
    match: {
      batch,
    },
  } = searchQuery;
  return {
    hits, batch,
  };
}
/**
 *
 * @param {*} client
 * @param {*} batchId
 * @return {result}
 */
async function rollbackBatch(client, batchId) {
  const {
    hits,
    batch,

  } = await getBatchMigrations(client,
      batchId);
  // Reverse the order to rollback the latest migrations first
  if (!batch) {
    return {
      message: `no migrations to rollback`,
    };
  }
  const migrations = hits.reverse();
  let direction;
  for (const migration of migrations) {
    const oppositeAction = migration._source.action === 'up' ? 'down' : 'up';
    direction = oppositeAction;
    try {
    // Run the migration
      await runMigration(client, migration._source.name, oppositeAction);

      // Upsert the migration in the index with opposite action
      await addMigrationToIndex(client,
          migration._source.name,
          batchId,
          oppositeAction);
    } catch (err) {
      console.error(`Failed to rollback migration: 
      ${migration._source.name}`, err);
      throw err;
    }
  }

  if (direction === `down`) {
    await deleteMigratedDownDocuments(client, batch);
  }

  return {
    message: `Successfully rolled back ${migrations.length} 
    migrations with batchId: ${batch}`,
    migrations,
  };
}
/**
 *
 * @param {*} filepath
 * @return {result}
 */
function getFilesFromDirectory(filepath) {
  const files = fs.readdirSync(filepath);
  const filteredFiles = files.filter((file) => path.extname(file) === '.js');

  // Sort migration files in chronological order (by filename)
  filteredFiles.sort();

  return filteredFiles;
}
/**
 *
 * @return {files}
 */
function getMigrationsFromDirectory() {
  return getFilesFromDirectory(migrationsDir);
}
/**
 *
 * @return {files}
 */
function getSeedsFromDirectory() {
  return getFilesFromDirectory(seedsDir);
}
/**
 *
 * @param {*} newMigrations
 * @param {*} direction
 * @param {*} client
 * @return {result}
 */
async function processMigrations(newMigrations, direction, client) {
  // If there are no new migrations, return
  if (newMigrations.length === 0) {
    return {
      message: `No new migrations to run.`,
    };
  }
  const batchId = path.parse(newMigrations[0]).name;

  console.log(`batchId`, batchId);

  // Run each migration in sequence
  for (const migrationFile of newMigrations) {
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

      throw new Error(`Latest migration failed. All previous migrations
       of this batch have been rolled back.`);
    }
  }
  return {
    batchId, migrations: newMigrations,
  };
}
/**
 *
 * @param {*} client
 * @param {*} direction
 * @return {result}
 */
async function getProcessedMigrations(client, direction = `up`) {
  const dirMigrations = getMigrationsFromDirectory();
  const indexMigrations = await getMigrationsFromIndex(
      client,
      direction,
      `migration_history`);
  return dirMigrations.filter((file) => indexMigrations.includes(
      path.parse(file).name));
}
/**
 *
 * @param {*} client
 * @param {*} direction
 * @return {result}
 */
async function getPendingMigrations(client, direction = `up`) {
  const dirMigrations = getFilesFromDirectory(migrationsDir);
  const indexMigrations = await getMigrationsFromIndex(
      client,
      direction,
      `migration_history`);

  // Find migrations that exist in the directory but not in the index
  return dirMigrations.filter((file) => !indexMigrations.includes(
      path.parse(file).name));
}
/**
 *
 * @param {*} client
 * @param {*} direction
 * @return {result}
 */
async function getPendingSeeds(client, direction = `up`) {
  const dirMigrations = getFilesFromDirectory(seedsDir);
  const indexSeeds = await getMigrationsFromIndex(
      client, direction, `seed_history` );

  // Find migrations that exist in the directory but not in the index
  return dirMigrations.filter((file) => !indexSeeds.includes(
      path.parse(file).name));
}
/**
 *
 * @param {*} client
 * @param {*} index
 * @param {*} properties
 * @return {result}
 */
async function createHistoryIndex(client, index, properties) {
  exists = await client.indices.exists({
    index,
  });
  if (!exists) {
    await client.indices.create({
      index,
      body: {
        mappings: {
          properties,
        },
      },
    });
  }
  return exists;
}
/**
 *
 * @param {*} client
 */
async function initDB(client) {
  await createHistoryIndex(client, `migration_history`, {
    name: {
      type: 'keyword',
    },
    action: {
      type: 'keyword',
    },
    timestamp: {
      type: 'date',
    },
    batch: {
      type: `keyword`,
    },
  });
  await createHistoryIndex(client, `seed_history`, {
    name: {
      type: `keyword`,
    },
    action: {
      type: `keyword`,
    },
    timestamp: {
      type: `date`,
    },
  });
}
/**
 *
 * @param {*} client
 * @param {*} batchId
 */
async function deleteMigratedDownDocuments(client, batchId) {
  if (!batchId) {
    throw new Error('No batchId provided for deleteMigratedDownDocuments');
  }

  await client.deleteByQuery({
    index: 'migration_history',
    refresh: true,
    body: {
      query: {
        bool: {
          must: [
            {
              match: {
                action: 'down',
              },
            },
            {
              match: {
                batch: batchId,
              },
            },
          ],
        },
      },
    },
  });

  console.log(`Documents with action 'down' and batch ${batchId} 
  have been deleted and index has been refreshed`);
}
/**
 *
 * @param {*} client
 * @return {result}
 */
async function getBatchPropertiesSorted(client) {
  const response = await client.search({
    index: 'migration_history',
    body: {
      size: 0,
      aggs: {
        batch_ids: {
          terms: {
            field: 'batch',
            order: {
              _key: 'desc',
            },
          },
        },
      },
    },
  });

  // Retrieve the batch ids from the response
  const batchIds = response.aggregations.batch_ids.buckets.map(
      (bucket) => bucket.key);

  return batchIds;
}
/**
 *
 * @param {*} pendingSeeds
 * @param {*} direction
 * @param {*} client
 * @return {result}
 */
async function processSeeds(pendingSeeds, direction, client) {
  // If there are no new seeds, return
  if (pendingSeeds.length === 0) {
    return {
      message: `No new seeds to run.`,
    };
  }

  // Run each seed in sequence
  for (const seedFile of pendingSeeds) {
    const seedName = path.parse(seedFile).name;
    console.log(`Running seed: ${seedName}`);

    try {
      // Run the migration
      await runSeed(client, seedName, direction);

      // Add migration to index
      await addSeedToIndex(client, seedName, direction);

      console.log(`Seed completed: ${seedName}`);
    } catch (err) {
      console.error(`Seed failed: ${seedName}`, err);

      throw err;
    }
  }
  return {
    message: `successfully seeded ${pendingSeeds.length} files`,
  };
}
/**
 *
 * @param {*} client
 * @param {*} indexName
 * @return {result}
 */
async function destroyIndex(client, indexName) {
  try {
    const response = await client.indices.delete({
      index: indexName,
    });
    console.log(`Index '${indexName}' deleted successfully.`);
    return response;
  } catch (error) {
    console.error(`Error deleting index '${indexName}':`, error);
    throw error;
  }
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
  createHistoryIndex,
  initDB,
  deleteMigratedDownDocuments,
  getBatchMigrations,
  getBatchPropertiesSorted,
  getPendingSeeds,
  processSeeds,
  getSeedsFromDirectory,
  destroyIndex,
};
