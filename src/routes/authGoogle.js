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
      callbackURL: `https://${process.env['HOST']}:${process.env['PORT']}/user/oauth2/redirect/google`,
      scope: ['profile'],
      state: true
    },
    async function verify(accessToken, refreshToken, profile, cb) {
      try {
        if (!profile?.id || !profile?.displayName || !profile?.provider) {
          throw new Error('Google profile is missing id/provider property')
        }

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
          if (!profile?.displayName) {
            throw new Error('Google profile is missing displayName property')
          }
          // Init new user
          const {
            rows: [newUser]
          } = await db.query(
            format('SELECT * FROM insert_user(%L)', profile.displayName)
          )
          if (!newUser) {
            throw new Error('insert_user() not returning new user data')
          }
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
          if (!credential?.user_id) {
            throw new Error('Credential is missing user_id property')
          }

          const {
            rows: [user]
          } = await db.query(
            format(
              'SELECT id, username FROM users WHERE id = %L',
              credential.user_id
            )
          )

          if (!user) {
            throw new Error('User not found for given credential')
          }

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
  passport.authenticate('google', function (error, user, info) {
    if (error) {
      return next(error)
    }

    if (!user && info) {
      return res.status(info.statusCode).json(info.response)
    }

    req.logIn(user, function (error) {
      if (error) {
        return next(error)
      }

      res.redirect(`${process.env.CLIENT_URL}/account`)
    })
  })(req, res, next)
})

module.exports = router
