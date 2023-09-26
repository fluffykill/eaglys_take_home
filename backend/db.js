const { Pool } = require("pg"); 
const dotenv = require('dotenv');
dotenv.config();

const user = process.env.DB_USER;
const password = process.env.DB_PASSWORD;
const host = process.env.HOST;
const port = process.env.DBPORT;

const pool = new Pool({
  user,
  password,
  host,
  database: "eaglys",
  port,
});

module.exports = pool;