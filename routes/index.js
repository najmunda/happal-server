import users from "./users.js";

function mountRoutes(app) {
  app.use('/users', users);
}

export default mountRoutes;