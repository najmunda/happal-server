const PromiseRouter = require('express-promise-router')
const PouchDB = require('../db/cards.js')
const { checkAuthentication } = require('./user.js')
const { cardDocsSchema, revsObjectSchema } = require('../utils/schemas.js')

const router = new PromiseRouter()

const db = require('express-pouchdb')(PouchDB.config, {
  configPath: `./${PouchDB.dir}/config.json`,
  logPath: './log/pouchlog.txt',
  mode: 'minimumForPouchDB'
})

router.use('/', checkAuthentication)

router.use('/', function (req, res, next) {
  const originalSend = res.send
  const userDocsId = req.user['user_docs_id']
  res.send = function (body) {
    try {
      // Change every "[]-card-..."
      let bodyStr = body.toString()
      if (bodyStr.includes(`${userDocsId}-card-`)) {
        bodyStr = bodyStr.replaceAll(`${userDocsId}-card-`, 'card-')
        originalSend.call(this, Buffer.from(bodyStr))
      } else {
        originalSend.call(this, body)
      }
    } catch (error) {
      next(error)
    }
  }
  next()
})

router.use('/', function (req, res) {
  const userDocsId = req.user['user_docs_id']

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
  if (req.url.startsWith('/_changes')) {
    req.url =
      req.url +
      `&startkey="${userDocsId}-card-"&endkey="${userDocsId}-card-\ufff0"`
  }

  let bodyStr = JSON.stringify(req.body)
  if (bodyStr.includes('card-')) {
    bodyStr = bodyStr.replaceAll('card-', `${userDocsId}-card-`)
    req.body = JSON.parse(bodyStr)
  }

  req.url = `/cards${req.url}`
  db(req, res)
})

module.exports = router
