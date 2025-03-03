import pg from "pg";

const { Pool } = pg;
const pool = new Pool();

export default pool;

export function query(text, params) {
  return pool.query(text, params);
}