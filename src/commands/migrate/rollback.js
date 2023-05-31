const {
  initDB,
  rollbackBatch,
  getBatchPropertiesSorted,

} = require(`../../utils/helpers`);
/**
 *
 * @param {*} client
 * @param {*} all
 * @return {message}
 */
async function rollback(client, all) {
// ensure indices are created
  await initDB(client);
  if (all) {
    const batchIds = await getBatchPropertiesSorted(client);
    for (const batchId of batchIds) {
      await rollbackBatch(client, batchId);
    }
    if (batchIds.length) {
      return {
        message: `all migrations successfully reverted`,
      };
    } else {
      return {
        message: `no migrations to rollback`,
      };
    }
  } else {
    return await rollbackBatch(client);
  }
}

module.exports = rollback;
