const user = require('./user.js')
const cardDb = require('./cardDb.js')
const authGoogle = require('./authGoogle.js')
const server = require('./server.js')

function mountRoutes(app) {
  app.use('/user', user)
  app.use('/db', cardDb)
  app.use('/user', authGoogle)
  app.use('/server', server)
}

module.exports = mountRoutes
