const PromiseRouter = require("express-promise-router");
const PouchDB = require("../db/cards.js");

try {
  const router = new PromiseRouter();

  const db = require("express-pouchdb")(PouchDB.config, {mode: 'minimumForPouchDB'});

  router.use("/", function (req, res) {
    if (req.isAuthenticated()) {
      try {
        req.url = `/db-${req.user.username}${req.url}`;
        db(req, res);
      } catch (error) {
        return res.status(500).send('Error occured on PouchDB.')
      }
    } else {
      return res.send(401, "User not autheticated.");
    }
  });

  console.log("cards: PouchDB is ready.");

  module.exports = router;
} catch (error) {
  console.log("cards: ", error);
}