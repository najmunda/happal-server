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
    next()
  } else {
    return res
      .status(401)
      .json({ status: 'error', message: 'User not authenticated' })
  }
}

// General Users/Auth Routes
router.get('/me', checkAuthentication, async function (req, res, next) {
  const {
    user: { id: userId }
  } = req

  if (!userId) {
    throw new Error('Request object is missing user.id')
  }

  const {
    rows: [userDetail]
  } = await db.query(
    format('SELECT id, username, last_sync FROM users WHERE id = %L', userId)
  )

  if (!userDetail) {
    throw new Error('Query did not return user detail')
  }

  return res.status(200).json({ status: 'success', data: { userDetail } })
})

router.post('/last-sync', checkAuthentication, async function (req, res, next) {
  const {
    user: { id: userId }
  } = req

  if (!userId) {
    throw new Error('Request object is missing user.id')
  }

  await db.query(
    format(
      'UPDATE users SET last_sync = CURRENT_TIMESTAMP WHERE id = %L',
      userId
    )
  )

  return res.status(200).json({ status: 'success', data: null })
})

router.post('/logout', function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err)
    }

    return res.status(200).json({ status: 'success', data: null })
  })
})

module.exports = router
module.exports.checkAuthentication = checkAuthentication
