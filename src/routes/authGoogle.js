const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth')
const format = require('pg-format')
const PromiseRouter = require('express-promise-router')
const db = require('../db/index.js')
const { initUserCardsDB } = require('../db/cards.js')

const router = new PromiseRouter()

passport.use(
  new GoogleStrategy.OAuth2Strategy(
    {
      clientID: process.env['GOOGLE_CLIENT_ID'],
      clientSecret: process.env['GOOGLE_CLIENT_SECRET'],
      callbackURL: 'http://localhost:3000/user/oauth2/redirect/google',
      scope: ['profile'],
      state: true
    },
    async function verify(accessToken, refreshToken, profile, cb) {
      try {
        const {
          rows: [credential]
        } = await db.query(
          format(
            'SELECT * FROM credentials WHERE provider_id = %L AND provider = %L',
            profile.id,
            profile.provider
          )
        )
        if (!credential) {
          // Init new user
          const {
            rows: [newUser]
          } = await db.query(
            format('SELECT * FROM insert_user(%L)', profile.displayName)
          )
          initUserCardsDB(newUser.username)
          // Init new user google credential
          await db.query(
            format(
              'INSERT INTO credentials (user_id, provider_id, provider) VALUES (%L, %L, %L)',
              newUser.id,
              profile.id,
              profile.provider
            )
          )
          return cb(null, newUser)
        } else {
          // User already registered with google account
          const {
            rows: [user]
          } = await db.query(
            format(
              'SELECT id, username FROM users WHERE id = %L',
              credential.user_id
            )
          )
          return cb(null, user)
        }
      } catch (error) {
        cb(error)
      }
    }
  )
)

// Redirect to Google Route
router.get('/login/google', passport.authenticate('google'))

// Route for processing authenticate response and logs user in, after user back to the app
router.get('/oauth2/redirect/google', function (req, res, next) {
  passport.authenticate('google', function (error, user) {
    if (error) {
      return next(error)
    }

    req.logIn(user, function (error) {
      if (error) {
        return next(error)
      }

      res.redirect('http://localhost:5173/account')
    })
  })(req, res, next)
})

module.exports = router
