const run = require(`./run`)
const make = require(`./make`)
const destroy = require(`./destroy`)

class Seed {
    constructor(client) {
        this.client = client
    }
    async run(...args) {
        return run(this.client, ...args)
    }
    async make(...args) {
        return make(...args)
    }
    async destroy(...args) {
        return destroy(this.client, ...args)
    }
}

module.exports = Seed