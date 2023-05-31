const {
  destroyIndex,
  initDB,

} = require(`../../utils/helpers`);

module.exports = async function destroy(client) {
  await initDB(client);
  return await destroyIndex(client, 'migration_history');
};
