const PromiseRouter = require('express-promise-router')

const router = new PromiseRouter()

router.get('/status', function (req, res) {
  return res.status(200).send('Online')
})

module.exports = router
