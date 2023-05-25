
module.exports.up = async (client) => {
  // TODO: Implement up migration
  await client.index({
    index: 'game-of-thrones',
    document: {
      character: 'Ned Stark',
      quote: 'Winter is coming.'
    }
  })
  await client.indices.refresh({ index: 'game-of-thrones' })
};

module.exports.down = async (client) => {
   await client.deleteByQuery({
    index: `game-of-thrones`,
    body: {
      query: {
        match: {
          "character": `Ned Stark`
        }
      }
    }
   })
   await client.indices.refresh({ index: 'game-of-thrones' })
};
  