const fs = require('fs');
const path = require('path');
const config = require(`../../utils/config`);

module.exports = function make(name) {
  const template = `
module.exports.up = async (client) => {
  // TODO: Implement seed 
};
  `;

  const seedsDir = config.seedsDir || './seeds';
  const date = new Date().toISOString().replace(/[-:.]/g, '');
  const filename = `${date}_${name}.js`;
  const filepath = path.join(seedsDir, filename);

  if (!fs.existsSync(seedsDir)) {
    fs.mkdirSync(seedsDir);
  }

  fs.writeFileSync(filepath, template);

  console.log(`Created seed: ${filepath}`);
}
