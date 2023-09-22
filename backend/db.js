const { Pool } = require("pg"); 

const user = process.env.DB_USER;
const password = process.env.DB_PASS;
const host = process.env.HOST

const pool = new Pool({
  user,
  host,
  database: "eaglys",
  password,
  port: 5432,
});

module.exports = pool;