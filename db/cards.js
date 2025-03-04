const PouchDB = require('pouchdb');

const config = PouchDB.defaults({prefix: "./databases/"});

module.exports = PouchDB;

module.exports.config = config;