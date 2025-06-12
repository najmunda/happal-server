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

// General Users/Auth Routes
router.get('/me', function (req, res, next) {
  if (req.isAuthenticated()) {
    db.query(
      format(
        'SELECT id, username, last_sync FROM users WHERE id = %L',
        req.user['id']
      ),
      function (err, result) {
        if (err) {
          return next(err)
        }
        const userDetail = result.rows[0]
        return res.status(200).json(userDetail)
      }
    )
  } else {
    return res.send(401, 'User not autheticated.')
  }
})

router.post('/last-sync', function (req, res, next) {
  if (req.isAuthenticated()) {
    db.query(
      format(
        'UPDATE users SET last_sync = CURRENT_TIMESTAMP WHERE id = %L',
        req.user['id']
      ),
      function (err) {
        if (err) {
          return next(err)
        }
        return res.status(200).send('Last sync updated.')
      }
    )
  } else {
    return res.send(401, 'User not autheticated.')
  }
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
