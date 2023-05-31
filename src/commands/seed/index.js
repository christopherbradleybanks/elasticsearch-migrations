const run = require(`./run`);
const make = require(`./make`);
const destroy = require(`./destroy`);
/**
 *
 */
class Seed {
  /**
   *
   * @param {*} client
   */
  constructor(client) {
    this.client = client;
  }
  /**
   *
   * @param  {...any} args
   * @return {message}
   */
  async run(...args) {
    return run(this.client, ...args);
  }
  /**
   *
   * @param  {...any} args
   * @return {message}
   */
  async make(...args) {
    return make(...args);
  }
  /**
   *
   * @param  {...any} args
   * @return {message}
   */
  async destroy(...args) {
    return destroy(this.client, ...args);
  }
}

module.exports = Seed;
