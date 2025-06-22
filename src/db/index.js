const pg = require('pg')

const { Pool } = pg
const pool = new Pool()

function query(text) {
  return pool.query(text)
}

module.exports.pool = pool
module.exports.query = query
