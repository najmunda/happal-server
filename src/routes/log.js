const PromiseRouter = require('express-promise-router')
const format = require('pg-format')
const db = require('../db/index.js')

const router = new PromiseRouter()

// General Users/Auth Routes
router.post('/client', async function (req, res, next) {
  const { log } = req.body
  if (Array.isArray(log)) {
    await db.query(
      format(
        'INSERT INTO client_logs ("timestamp", "level", "type", "service", "message", stack, user_agent) SELECT * FROM json_populate_recordset(NULL::client_log, %L)',
        JSON.stringify(log)
      )
    ).catch(error => {
      const handledError = new Error('', { cause: error });
      throw handledError;
    });
  } else {
    return res.status(400).send('Invalid logs format')
  }
  return res.status(200).send('Client logs sent')
})

module.exports = router
