const { Client } = require('@elastic/elasticsearch');
const config = require('./config');

async function createClient() {
  const env = process.env.NODE_ENV || 'development';
  const clientConfig = config[env].elasticsearchOptions;

  if (!clientConfig) {
    throw new Error(`Invalid environment: ${env}`);
  }

  const client = new Client(clientConfig);

  await createMigrationHistoryIndex(client);

  return client;
}

async function createMigrationHistoryIndex(client) {
  const { body } = await client.indices.exists({ index: 'migration_history' });
  if (!body) {
    await client.indices.create({ index: 'migration_history' });
  }
}

module.exports = createClient;
