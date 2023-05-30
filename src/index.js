const {Migrate, Seed} = require('./commands');
const Client = require(`./utils/client`)

class ElasticMigrations {
  constructor(options){
    const {client} = new Client(options)
    this.client = client
    this.migrate = new Migrate(client)
    this.seed = new Seed(client)
    return this
  }
}

module.exports = ElasticMigrations