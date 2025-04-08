const pg = require('pg');

try {
  const { Pool } = pg;
  const pool = new Pool();

  function query(text, callback) {
    return pool.query(text, [], callback);
  }

  console.log("db: Database connected.");
  
  module.exports.pool = pool;
  module.exports.query = query;
} catch (error) {
  console.log("db: ", error);
}