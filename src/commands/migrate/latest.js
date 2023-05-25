const {processMigrations, getPendingMigrations, initDB, } = require(`../../utils/helpers`)

async function latest(client) {
    //ensure indices are created
    await initDB(client)
    // Get migrations from the directory and the index
    let pendingMigrations = await getPendingMigrations(client, `up`);
  
    // Sort migrations by name (which should correspond to timestamp due to naming convention)
    pendingMigrations.sort();
  
    // Create a batch ID based on the timestamp of the first migration in the batch
    const {batchId, message} = await processMigrations(pendingMigrations, `up`, client);
    if(!batchId){
      return {message}
    }
    return {message: `Migrations applied starting from ${batchId}`}
  }

  module.exports = latest

