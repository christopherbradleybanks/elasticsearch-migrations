const { processMigrations, getProcessedMigrations, initDB } = require('../../utils/helpers');

async function down(client, targetMigration) {
  //ensure indices are created
  await initDB(client)
  // Get migrations from the index that have been run up
  let processedMigrations = await getProcessedMigrations(client, 'up');

  // Reverse the order to get the latest migrations first
  processedMigrations = processedMigrations.sort().reverse();

  // If targetMigration is specified, run migrations until that one
  if (targetMigration) {
    const targetIndex = processedMigrations.indexOf(targetMigration);
    if (targetIndex === -1) {
      throw new Error('Target migration not found or not in "up" state');
    }

    // Adjust indexMigrations to include migrations up to and including the target
    processedMigrations = processedMigrations.slice(0, targetIndex + 1);
  } else {
    // If targetMigration is not specified, just run the last migration
    processedMigrations = processedMigrations.slice(0, 1);
  }
  const {batchId, message} = await processMigrations(processedMigrations, 'down', client)
  if(!batchId) {
    return {message}
  }
  if(targetMigration){
    return {message: `Migrations reverted starting from ${batchId} until ${targetMigration}`}
  }
  else {
    return {message: `Migration ${batchId} successfully reverted.`}
  }
}

module.exports = down;
