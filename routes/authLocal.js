const passport = require("passport");
const LocalStrategy = require("passport-local");
const format = require("pg-format");
const crypto = require("node:crypto");
const PromiseRouter = require("express-promise-router");
const db = require("../db/index.js");
const { initUserCardsDB } = require("../db/cards.js");

const router = new PromiseRouter();

// Set Local Strategy
passport.use(
  new LocalStrategy(function verify(username, password, cb) {
    db.query(
      format("SELECT * FROM users WHERE username = %L", username),
      function (err, result) {
        if (err) {
          return cb(err);
        }
        const row = result.rows[0];
        if (!row) {
          return cb(null, false, {
            message: "Incorrect username or password.",
          });
        }

        crypto.pbkdf2(
          password,
          row.salt,
          310000,
          32,
          "sha256",
          function (err, hashedPassword) {
            if (err) {
              return cb(err);
            }
            if (!crypto.timingSafeEqual(row.hashed_password, hashedPassword)) {
              return cb(null, false, {
                message: "Incorrect username or password.",
              });
            }
            return cb(null, row);
          },
        );
      },
    );
  }),
);

// Routes
router.post("/signup", function (req, res, next) {
  const salt = crypto.randomBytes(16);
  crypto.pbkdf2(
    req.body.password,
    salt,
    310000,
    32,
    "sha256",
    function (err, hashedPassword) {
      if (err) {
        return next(err);
      }
      db.query(
        format(
          "INSERT INTO users (username, hashed_password, salt) VALUES (%L, %L, %L) RETURNING id",
          req.body.username,
          hashedPassword,
          salt,
        ),
        function (err, result) {
          if (err) {
            return next(err);
          }
          const user = {
            id: result.rows[0].id,
            username: req.body.username,
          };
          initUserCardsDB(user.id);
          res.send({ message: "User signed." });
        },
      );
    },
  );
});

router.post("/login", function (req, res, next) {
  passport.authenticate("local", function (err, user, info) {
    if (err) {
      return next(err);
    }

    if (!user) {
      return res.send(400, "Incorrect username");
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
  })(req, res, next);
});

module.exports = router;
