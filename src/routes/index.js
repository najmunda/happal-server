const user = require('./user.js')
const cardDb = require('./cardDb.js')
const authGoogle = require('./authGoogle.js')
const server = require('./server.js')
const log = require('./log.js')

function mountRoutes(app) {
  app.use('/user', user)
  app.use('/db', cardDb)
  app.use('/user', authGoogle)
  app.use('/server', server)
  app.use('/log', log)
}

module.exports = mountRoutes
