const PouchDB = require('pouchdb')
const fs = require('node:fs')

const cardDbDir = './databases/'

if (fs.existsSync(cardDbDir) == false) {
  fs.mkdirSync(cardDbDir)
}

fs.accessSync(cardDbDir)

const config = {
  prefix: cardDbDir
}

function initUserCardsDB(userid) {
  return new PouchDB(`db-${userid}`, config)
}

module.exports.config = PouchDB.defaults(config)
module.exports.initUserCardsDB = initUserCardsDB
