const PromiseRouter = require("express-promise-router");
const PouchDB = require("../db/cards.js");
const { checkAuthentication } = require("./authLocal.js");

try {
  const router = new PromiseRouter();

  const db = require("express-pouchdb")(PouchDB.config);

  router.use("/", checkAuthentication, function (req, res) {
    db(req, res);
  });

  console.log("cards: PouchDB is ready.");

  module.exports = router;
} catch (error) {
  console.log("cards: ", error);
}