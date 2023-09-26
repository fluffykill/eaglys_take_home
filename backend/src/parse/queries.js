const format = require('pg-format')

const getAllHashedColumnsQuery = "SELECT column_name, column_hash FROM hashed_columns;";

const createHashedColumns = (columns) => format("INSERT INTO hashed_columns (column_name, column_hash) VALUES %L ON CONFLICT (column_name) DO NOTHING RETURNING *;", columns);

module.exports = {
  getAllHashedColumnsQuery,
  createHashedColumns,
};