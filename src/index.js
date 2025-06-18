const express = require('express')
const path = require('path')
const cors = require('cors')
const session = require('express-session')
const passport = require('passport')
const db = require('./db/index.js')
const { requestLogger } = require('./logger.js')
const mountRoutes = require('./routes/index.js')

const app = express()

app.use(express.static(path.join(__dirname, process.env.CLIENTDIR, './dist')))
app.use(express.json())

// CORS
const corsOption = {
  credentials: true
}
// if (app.get('env') === 'production') {
//     corsOption.origin = 'SET YOUR FRONTEND LINK'
// }
app.use(cors(corsOption))

// Session
const pgStore = require('connect-pg-simple')(session)
const sessionOption = {
  secret: process.env.SECRET,
  resave: false,
  store: new pgStore({
    pool: db.pool,
    createTableIfMissing: true
  }),
  rolling: true,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24 * 14 }
}
if (app.get('env') === 'production') {
  app.set('trust proxy', 1)
  sessionOption.cookie.secure = true
  sessionOption.sameSite = 'none'
}
app.use(session(sessionOption))
app.use(passport.authenticate('session'))
app.use(requestLogger)
mountRoutes(app)

// Start the server
const PORT = process.env.PORT || 8080
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`)
  console.log('Press Ctrl+C to quit.')
})
