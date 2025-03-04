const PouchDB = require('pouchdb');

const config = {
  prefix: "./databases/"
}

function initUserCardsDB(userid) {
  return new PouchDB(`db-${userid}`, config);
}

module.exports.config = PouchDB.defaults(config);
module.exports.initUserCardsDB = initUserCardsDB;