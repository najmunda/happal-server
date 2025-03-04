const pg = require('pg');

const { Pool } = pg;
const pool = new Pool();

function query(text, params) {
  return pool.query(text, params);
}

module.exports.pool = pool;
module.exports.query = query;