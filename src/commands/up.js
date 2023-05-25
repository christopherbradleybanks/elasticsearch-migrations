const { processMigrations, getPendingMigrations } = require('../utils/helpers');

async function up(client, targetMigration) {
   // Find migrations that exist in the directory but not in the index
  let pendingMigrations = await getPendingMigrations(client, `up`)
   pendingMigrations.sort()
  // If targetMigration is specified, run migrations until that one
  if (targetMigration) {
    const targetIndex = pendingMigrations.indexOf(targetMigration);
    if (targetIndex === -1) {
      throw new Error('Target migration not found or already executed');
    }

    // Adjust pendingMigrations to include migrations up to and including the target
    pendingMigrations = pendingMigrations.slice(0, targetIndex + 1);
  } else {
    // If targetMigration is not specified, just run the next migration
    pendingMigrations = pendingMigrations.slice(0, 1);
  }
  
  if (pendingMigrations.length === 0) {
    return {
      message: `No new migrations to run.`
    };
  }

  // Create a batch ID based on the timestamp of the first migration in the batch
  const {batchId, message} = await processMigrations(pendingMigrations, `up`, client);
  if(!batchId) {
    return {message}
  }
  if(targetMigration){
    return {message: `Migrations applied starting from ${batchId}`}
  }
  else {
    return {message: `Migration ${batchId} successfully executed.`}
  }
}

module.exports = up;
