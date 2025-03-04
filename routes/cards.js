const PromiseRouter = require('express-promise-router');
const PouchDB = require('../db/cards.js');
const { checkAuthentication } = require('./users.js')

const router = new PromiseRouter();

// const config = PouchDB.defaults({prefix: "./databases/"});
const db = require('express-pouchdb')(PouchDB.config);

router.use("/", checkAuthentication, function(req, res) {
  db(req, res);
});

module.exports = router;