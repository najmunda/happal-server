const PromiseRouter = require('express-promise-router')
const PouchDB = require('../db/cards.js')
const { checkAuthentication } = require('./user.js')
const { cardDocsSchema, revsObjectSchema } = require('../utils/schemas.js')

const router = new PromiseRouter()

const db = require('express-pouchdb')(PouchDB.config, {
  mode: 'minimumForPouchDB'
})

router.use('/', checkAuthentication, function (req, res) {
  if (req.url == '/_revs_diff' && req.method == 'POST') {
    const { error } = revsObjectSchema.validate(req.body)
    if (error) {
      return res
        .status(400)
        .json({ status: 'fail', data: { body: 'Invalid request body' } })
    }
  }
  if (req.url == '/_bulk_docs' && req.method == 'POST') {
    const { error } = cardDocsSchema.validate(req.body.docs, {
      abortEarly: true
    })
    if (error) {
      return res
        .status(400)
        .json({ status: 'fail', data: { docs: 'Invalid request body' } })
    }
  }
  req.url = `/db-${req.user.username}${req.url}`
  db(req, res)
})

module.exports = router
