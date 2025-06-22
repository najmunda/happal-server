const passport = require('passport')
const PromiseRouter = require('express-promise-router')
const format = require('pg-format')
const db = require('../db/index.js')

const router = new PromiseRouter()

// Set passport for all strategy
passport.serializeUser(function (user, cb) {
  process.nextTick(function () {
    cb(null, { id: user.id, username: user.username })
  })
})

passport.deserializeUser(function (user, cb) {
  process.nextTick(function () {
    cb(null, user)
  })
})

const checkAuthentication = function (req, res, next) {
  if (req.isAuthenticated()) {
    console.log('auth!')
    next()
  } else {
    return res.status(401).send('User not authenticated.')
  }
}

// General Users/Auth Routes
router.get('/me', checkAuthentication, async function (req, res, next) {
  const {
    rows: [userDetail]
  } = await db.query(
    format(
      'SELECT id, username, last_sync FROM users WHERE id = %L',
      req.user['id']
    )
  )
  return res.status(200).json(userDetail)
})

router.post('/last-sync', checkAuthentication, async function (req, res, next) {
  await db.query(
    format(
      'UPDATE users SET last_sync = CURRENT_TIMESTAMP WHERE id = %L',
      req.user['id']
    )
  )
  return res.status(200).send('Last sync updated.')
})

router.post('/logout', function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err)
    }
    res.send({ message: 'User unauthenticated.' })
  })
})

module.exports = router
module.exports.checkAuthentication = checkAuthentication
