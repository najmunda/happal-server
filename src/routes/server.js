const PromiseRouter = require('express-promise-router')

const router = new PromiseRouter()

// General Users/Auth Routes
router.get('/status', function (req, res) {
  return res.status(200).send('Online')
})

module.exports = router
