const PouchDB = require('pouchdb')
const fs = require('node:fs')

const cardDbDir = './database/'

const config = {
  prefix: cardDbDir
}

if (fs.existsSync(cardDbDir) == false) {
  fs.mkdirSync(cardDbDir)
  new PouchDB(`cards`, config)
}

fs.accessSync(cardDbDir)

module.exports.config = PouchDB.defaults(config)
module.exports.dir = cardDbDir
