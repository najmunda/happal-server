const user = require("./user.js");
const cardDb = require("./cardDb.js");
const authGoogle = require("./authGoogle.js");

function mountRoutes(app) {
  app.use('/user', user);
  app.use("/db", cardDb);
  app.use("/user", authGoogle);
}

module.exports = mountRoutes;
