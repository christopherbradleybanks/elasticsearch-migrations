const down = require(`./down`);
const up = require(`./up`);
const latest = require(`./latest`);
const rollback = require(`./rollback`);
const make = require(`./make`);
const destroy = require(`./destroy`);
/**
 *The Migrate Class
 */
class Migrate {
  /**
   *
   * @param {*} client
   */
  constructor(client) {
    this.client = client;
  }
  /**
   *
   * @param {...any} args
   * @return {message}
   */
  async down(...args) {
    return down(this.client, ...args);
  }
  /**
   *
   * @param  {...any} args
   * @return {message}
   */
  async up(...args) {
    return up(this.client, ...args);
  }
  /**
   *
   * @param  {...any} args
   * @return {message}
   */
  async latest(...args) {
    return latest(this.client, ...args);
  }
  /**
   *
   * @param  {...any} args
   * @return {message}
   */
  async rollback(...args) {
    return rollback(this.client, ...args);
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

module.exports = Migrate;
