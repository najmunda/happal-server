// const users = require("./authGoogle.js");
const cards = require("./cards.js");
const authGoogle = require("./authGoogle.js");

function mountRoutes(app) {
  // app.use('/users', users);
  app.use("/cards", cards);
  app.use("/", authGoogle);
}

module.exports = mountRoutes;
