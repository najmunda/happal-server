const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth')
const format = require('pg-format')
const PromiseRouter = require('express-promise-router')
const db = require('../db/index.js')
const { initUserCardsDB } = require('../db/cards.js')

const router = new PromiseRouter()

// Set Local Strategy
passport.use(
  new GoogleStrategy.OAuth2Strategy({
    clientID: process.env['GOOGLE_CLIENT_ID'],
    clientSecret: process.env['GOOGLE_CLIENT_SECRET'],
    callbackURL: 'http://localhost:3000/oauth2/redirect/google',
    scope: ['profile',],
    state: true,
  },
  function verify(accessToken, refreshToken, profile, cb) {
    console.log(profile);
    db.query(
      format('SELECT * FROM credentials WHERE provider_id = %L AND provider = %L', profile.id, profile.provider),
      function (err, result) {
        if (err) {
          return cb(err)
        }
        const cred = result.rows[0];
        if (!cred) {
          // Init new user
          db.query(
            format('SELECT * FROM insert_user(%L)', profile.displayName),
            function (err, result) {
              if (err) {
                return cb(err)
              }
              const newUser = result.rows[0];
              initUserCardsDB(newUser.username);
              db.query(
                format('INSERT INTO credentials (user_id, provider_id, provider) VALUES (%L, %L, %L)', newUser.id, profile.id, profile.provider),
                function (err, result) {
                  if (err) {
                    return cb(err)
                  }
                  return cb(null, newUser)
                }
              )
            }
          );
        } else {
          // User already registered with google account
          db.query(
            format('SELECT id, username FROM users WHERE id = %L', cred.user_id),
            function (err, result) {
              if (err) {
                return cb(err);
              }
              const user = result.rows[0];
              if (!user) {
                return cb(err);
              }
              return cb(null, user)
            }
          );
        }
      }
    );
  })
);

passport.serializeUser(function (user, cb) {
  process.nextTick(function () {
    cb(null, { id: user.id, username: user.username });
  });
});

passport.deserializeUser(function (user, cb) {
  process.nextTick(function () {
    cb(null, user);
  });
});

// Redirect to Google Route
router.get('/login/google', passport.authenticate('google'));

// Route for processing authenticate response and logs user in, after user back to the app
router.get('/oauth2/redirect/google',
  function (req, res, next) {
    passport.authenticate("google", function (err, user, info) {
      if (err) {
        return next(err);
      }

      req.logIn(user, function (err) {
        if (err) {
          return next(err);
        }

        res.send({
          user: { id: user.id, username: user.username },
          message: "User authenticated.",
        });
      });
    }
  )(req, res, next);
});

router.post("/logout", function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.send({ message: "User unauthenticated." });
  });
});

module.exports = router;