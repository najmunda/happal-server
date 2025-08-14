const fs = require('fs')
const https = require('https')
const express = require('express')
// const path = require('path')
const cors = require('cors')
const session = require('express-session')
const passport = require('passport')
const db = require('./db/index.js')
const { requestLogger, errorLogger } = require('./logger.js')
const mountRoutes = require('./routes/index.js')

const privateKey = fs.readFileSync('../happal.key', 'utf-8')
const certificate = fs.readFileSync('../happal.crt', 'utf-8')
const credentials = { key: privateKey, cert: certificate }
const app = express()

// app.use(express.static(path.join(__dirname, process.env.CLIENTDIR, './dist')))
app.use(express.json())

// CORS
const corsOption = {
  origin: process.env.CLIENT_URL,
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
  cookie: {
    secure: true,
    maxAge: 1000 * 60 * 60 * 24 * 14
  },
  sameSite: 'none'
}
app.set('trust proxy', 1)
app.use(session(sessionOption))
app.use(passport.authenticate('session'))
app.use(requestLogger)
mountRoutes(app)
app.use(errorLogger)

// Start the server
const httpsServer = https.createServer(credentials, app)
const PORT = process.env.PORT || 8080
httpsServer.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`)
  console.log('Press Ctrl+C to quit.')
})
