const {
  processSeeds,
  getPendingSeeds,
  initDB,

} = require('../../utils/helpers');
/**
 *
 * @param {*} client
 * @param {*} targetSeed
 * @return {message}
 */
async function run(client, targetSeed) {
  // ensure indices are created
  await initDB(client);
  // Find migrations that exist in the directory but not in the index
  let pendingSeeds = await getPendingSeeds(client, `up`);
  pendingSeeds.sort();
  // If targetMigration is specified, run migrations until that one
  if (targetSeed) {
    const targetIndex = pendingSeeds.indexOf(targetSeed);
    if (targetIndex === -1) {
      throw new Error('Target seed not found or already executed');
    }

    // Adjust pendingMigrations to include migrations
    // up to and including the target
    pendingSeeds = pendingSeeds.slice(targetIndex, targetIndex + 1);
  }

  if (pendingSeeds.length === 0) {
    return {
      message: `No new seeds to run.`,
    };
  }

  // Create a batch ID based on the timestamp of
  // the first migration in the batch
  return await processSeeds(pendingSeeds, `up`, client);
}

module.exports = run;
