const PouchDB = require('pouchdb');
const fs = require('node:fs');

try {
  fs.accessSync("./databases/");
} catch (error) {
  console.log("cards: ./databases not exist, init new folder.");
  fs.mkdirSync("./databases/");
} finally {
  const config = {
    prefix: "./databases/"
  }
  
  function initUserCardsDB(userid) {
    return new PouchDB(`db-${userid}`, config);
  }
  
  module.exports.config = PouchDB.defaults(config);
  module.exports.initUserCardsDB = initUserCardsDB;
}