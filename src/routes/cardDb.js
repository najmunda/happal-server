const PromiseRouter = require('express-promise-router')
const PouchDB = require('../db/cards.js')
const { checkAuthentication } = require('./user.js')
const { validateCardDoc } = require('../utils/validator')

const router = new PromiseRouter()

const db = require('express-pouchdb')(PouchDB.config, {
  mode: 'minimumForPouchDB'
})

router.use('/', checkAuthentication, function (req, res) {
  if (req.url == '/_bulk_docs' && req.method == 'POST') {
    const firstBadCardDocIndex = req.body.docs.findIndex(
      (cardDoc) => validateCardDoc(cardDoc) == false
    )
    if (firstBadCardDocIndex != -1) {
      return res.status(400).json({ error: 'Bad structure card exist.' })
    }
  }
  req.url = `/db-${req.user.username}${req.url}`
  db(req, res)
})

module.exports = router
