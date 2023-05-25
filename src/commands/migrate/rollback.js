const {initDB} = require(`../../utils/helpers`)

async function rollback() {
//ensure indices are created
  await initDB(client)
}

module.exports = rollback