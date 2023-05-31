require('dotenv').config();
const fs = require('fs');
const path = require('path');
const {env} = process;
const {
  MIGRATIONS_DIR,
  SEEDS_DIR,
  LOCAL_ELASTICSEARCH_URL,
  LOCAL_ELASTICSEARCH_AUTH,
  LOCAL_TLS_CA_CERT,
  LOCAL_TLS_REJECT_UNAUTHORIZED,
  LOCAL_CA_FINGERPRINT,
  PROD_ELASTICSEARCH_AUTH,
  PROD_TLS_REJECT_UNAUTHORIZED,
  PROD_TLS_CA_CERT,
  CLOUD_ID,
  PROD_CA_FINGERPRINT,
} = env;

const authStrategies = {
  basic: (username, password) => ({
    username, password,
  }),
  apiKey: (apiKey) => ({
    apiKey,
  }),
  bearer: (bearer) => ({
    bearer,
  }),
};

/**
 *
 * @param {*} authStr
 * @return {authStrategy}
 */
function getAuth(authStr) {
  const [type, ...args] = authStr.split(':');
  if (authStrategies[type]) {
    return authStrategies[type](...args);
  }
  throw new Error(`Invalid auth strategy: ${type}`);
}

const config = {
  migrationsDir: path.resolve(MIGRATIONS_DIR || './migrations'),
  seedsDir: path.resolve(SEEDS_DIR || `./seeds`),
  development: {
    elasticsearchOptions: {
      node: LOCAL_ELASTICSEARCH_URL || `http://localhost:9200`,
      auth: LOCAL_ELASTICSEARCH_AUTH ?
      getAuth(LOCAL_ELASTICSEARCH_AUTH) : undefined,
      tls: LOCAL_TLS_CA_CERT ?
      {
        ca: fs.readFileSync(LOCAL_TLS_CA_CERT),
        rejectUnauthorized: LOCAL_TLS_REJECT_UNAUTHORIZED !== 'false',
      } : undefined,
      caFingerprint: LOCAL_CA_FINGERPRINT || undefined,
    },
  },
  production: {
    elasticsearchOptions: {
      cloud: {
        id: CLOUD_ID,
      },
      auth: PROD_ELASTICSEARCH_AUTH ?
       getAuth(PROD_ELASTICSEARCH_AUTH) : undefined,
      tls: PROD_TLS_CA_CERT ? {
        ca: fs.readFileSync(PROD_TLS_CA_CERT),
        rejectUnauthorized: PROD_TLS_REJECT_UNAUTHORIZED !== 'false',
      } : undefined,
      caFingerprint: PROD_CA_FINGERPRINT || undefined,
    },
  },
};

module.exports = config;
