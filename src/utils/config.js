require('dotenv').config();
const fs = require('fs');
const path = require('path');

const authStrategies = {
  basic: (username, password) => ({ username, password }),
  apiKey: (apiKey) => ({ apiKey }),
  bearer: (bearer) => ({ bearer })
};

function getAuth(authStr) {
  const [type, ...args] = authStr.split(':');
  if (authStrategies[type]) {
    return authStrategies[type](...args);
  }
  throw new Error(`Invalid auth strategy: ${type}`);
}

const config = {
  migrationsDir: path.resolve(process.env.MIGRATIONS_DIR || './migrations'),
  seedsDir: path.resolve(process.env.SEEDS_DIR || `./seeds`),
  development: {
    elasticsearchOptions: {
      node: process.env.LOCAL_ELASTICSEARCH_URL || `http://localhost:9200`,
      auth: process.env.LOCAL_ELASTICSEARCH_AUTH ? getAuth(process.env.LOCAL_ELASTICSEARCH_AUTH) : undefined,
      tls: process.env.LOCAL_TLS_CA_CERT ? {
        ca: fs.readFileSync(process.env.LOCAL_TLS_CA_CERT),
        rejectUnauthorized: process.env.LOCAL_TLS_REJECT_UNAUTHORIZED !== 'false'
      } : undefined,
      caFingerprint: process.env.LOCAL_CA_FINGERPRINT || undefined
    }
  },
  production: {
    elasticsearchOptions: {
      cloud: {
        id: process.env.CLOUD_ID
      },
      auth: process.env.PROD_ELASTICSEARCH_AUTH ? getAuth(process.env.PROD_ELASTICSEARCH_AUTH) : undefined,
      tls: process.env.PROD_TLS_CA_CERT ? {
        ca: fs.readFileSync(process.env.PROD_TLS_CA_CERT),
        rejectUnauthorized: process.env.PROD_TLS_REJECT_UNAUTHORIZED !== 'false'
      } : undefined,
      caFingerprint: process.env.PROD_CA_FINGERPRINT || undefined
    }
  }
};

module.exports = config;