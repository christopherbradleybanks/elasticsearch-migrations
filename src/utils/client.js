const { Errors, Client } = require('@elastic/elasticsearch');
const config = require('./config');
 
function createClient(options) {
  const env = process.env.NODE_ENV || 'development';
  const clientConfig = options || config[env].elasticsearchOptions;
  if (!clientConfig) {
    throw new Error(`Invalid environment: ${env}`);
  }
  const client = new Client(clientConfig);
  return client;
}

class ElasticsearchClientSingleton {
    constructor(options){
      if (ElasticsearchClientSingleton.instance) {
        return ElasticsearchClientSingleton.instance
      }
      this.client = createClient(options)
      this.errors = Errors
      ElasticsearchClientSingleton.instance = this
    return this
  }
  getClient(){
    return this.client
  }
}

module.exports = ElasticsearchClientSingleton;
