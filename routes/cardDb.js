const PromiseRouter = require("express-promise-router");
const PouchDB = require("../db/cards.js");
const { validateCardDoc } = require('../utils/validator');

try {
  const router = new PromiseRouter();

  const db = require("express-pouchdb")(PouchDB.config, {mode: 'minimumForPouchDB'});

  router.use("/", function (req, res) {
    if (req.isAuthenticated()) {
      try {
        if (req.url == '/_bulk_docs' && req.method == 'POST') {
          const firstBadCardDocIndex = req.body.docs.findIndex(cardDoc => validateCardDoc(cardDoc) == false);
          if (firstBadCardDocIndex != -1) {
           throw new Error('Bad structure card exist.')
          }
        }
        req.url = `/db-${req.user.username}${req.url}`;
        db(req, res);
      } catch (error) {
        if (error.message == 'Bad structure card exist.') {
          return res.status(400).json({ error: error.message });
        }
        return res.status(500).json({ error: 'Error occured on PouchDB Server.' });
      }
    } else {
      return res.status(401).json({ error: "User not autheticated." });
    }
  });

  console.log("cards: PouchDB is ready.");

  module.exports = router;
} catch (error) {
  console.log("cards: ", error);
}