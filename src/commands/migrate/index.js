const down = require(`./down`)
const up = require(`./up`)
const latest = require(`./latest`)
const rollback = require(`./rollback`)
const make = require(`./make`)
const destroy = require(`./destroy`)
class Migrate {
    constructor(client){
        this.client = client
    }
    async down (...args){
        return down(this.client,...args)
    }
    async up(...args){
        return up(this.client,...args)
    }
    async latest(...args){
        return latest(this.client,...args)
    }
    async rollback(...args){
        return rollback(this.client,...args)
    }
    async make(...args){
        return make(this.client,...args)
    }
    async destroy(...args){
        return destroy(this.client, ...args)
    }
}

module.exports = Migrate