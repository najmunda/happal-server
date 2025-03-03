import express from 'express';
import passport from 'passport';
import LocalStrategy from 'passport-local';
import format from 'pg-format';
import * as db from '../db/index.js'
import * as crypto from 'node:crypto';
import PromiseRouter from 'express-promise-router';

const router = new PromiseRouter();

// Set Local Strategy
passport.use(new LocalStrategy(function verify(username, password, cb) {
  db.query(format('SELECT * FROM users WHERE username = %L', username), function(err, result) {
    if (err) { return cb(err); }
    const row = result.rows[0];
    if (!row) { return cb(null, false, { message: 'Incorrect username or password.' }); }
    
    crypto.pbkdf2(password, row.salt, 310000, 32, 'sha256', function(err, hashedPassword) {
      if (err) { return cb(err); }
      if (!crypto.timingSafeEqual(row.hashed_password, hashedPassword)) {
        return cb(null, false, { message: 'Incorrect username or password.' });
      }
      return cb(null, row);
    });
  });
}));

passport.serializeUser(function(user, cb) {
  process.nextTick(function() {
    cb(null, {id: user.id, username: user.username});
  });
});

passport.deserializeUser(function(user, cb) {
  process.nextTick(function() {
    cb(null, user);
  });
});

// Routes
router.post('/signup', function(req, res, next) {
  const salt = crypto.randomBytes(16);
  crypto.pbkdf2(req.body.password, salt, 310000, 32, 'sha256', function(err, hashedPassword) {
    if (err) {
      return next(err);
    }
    db.query(format('INSERT INTO users (username, hashed_password, salt) VALUES (%L, %L, %L) RETURNING id', req.body.username, hashedPassword, salt), function(err, result) {
      if (err) {
        return next(err);
      }
      const user = {
        id: result.rows[0].id,
        username: req.body.username,
      };
      req.logIn(user, function(err) {
        if (err) {
          return next(err);
        }
        res.send({'message': 'User signed and authenticated.'});
      });
    });
  });
});

router.post('/login', function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
      if (err) {
          return next(err);
      }

      if (!user) {
          return res.send(400, 'Incorrect username');
      }

      req.logIn(user, function(err) {
          if (err) {
              return next(err);
          }

          res.send({'message': 'User authenticated.'});
      });
  })(req, res, next);
});

router.post('/logout', function(req, res, next) {
  req.logout(function(err) {
    if (err) {
      return next(err);
    }
    res.send({'message': 'User unauthenticated.'});
  })
});

export default router;