const users = require("./users.js");
const cards = require("./cards.js");

function mountRoutes(app) {
  app.use('/users', users);
  app.use('/cards', cards);
}

module.exports = mountRoutes;