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
  const exists = await client.indices.exists({ index: 'migration_history' });
  if (!exists) {
    await client.indices.create({
        index: 'migration_history',
        body: {
          mappings: {
            properties: {
              name: { type: 'keyword' },
              action: { type: 'keyword' },
              timestamp: { type: 'date' }
            }
          }
        }
      });
  }
//   else {
//     await client.indices.putMapping({
//         index: 'migration_history',
//         body: {
//           properties: {
//             name: { type: 'keyword' },
//             action: { type: 'keyword' },
//             timestamp: { type: 'date' }
//           }
//         }
//       });
//   }
}

module.exports = createClient;
