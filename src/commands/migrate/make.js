const fs = require('fs');
const path = require('path');
const config = require(`../../utils/config`);

module.exports = function create(name) {
  const template = `
module.exports.up = async (client) => {
  // TODO: Implement up migration
};

module.exports.down = async (client) => {
  // TODO: Implement down migration
};
  `;

  const migrationsDir = config.migrationsDir || './migrations';
  const date = new Date().toISOString().replace(/[-:.]/g, '');
  const filename = `${date}_${name}.js`;
  const filepath = path.join(migrationsDir, filename);

  if (!fs.existsSync(migrationsDir)) {
    fs.mkdirSync(migrationsDir);
  }

  fs.writeFileSync(filepath, template);

  console.log(`Created migration: ${filepath}`);
};
