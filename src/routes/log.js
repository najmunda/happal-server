const PromiseRouter = require('express-promise-router')
const format = require('pg-format')
const db = require('../db/index.js')

const router = new PromiseRouter()

// General Users/Auth Routes
router.post('/client', async function (req, res, next) {
  const { log } = req.body
  if (Array.isArray(log) && log.length !== 0) {
    await db
      .query(
        format(
          'INSERT INTO client_logs ("timestamp", "level", "type", "service", "message", stack, user_agent) SELECT * FROM json_populate_recordset(NULL::client_log, %L)',
          JSON.stringify(log)
        )
      )
  } else {
    return res
      .status(400)
      .json({ status: 'fail', data: { logs: 'Invalid logs format' } })
  }
  return res.status(200).json({ status: 'success', data: null })
})

module.exports = router
