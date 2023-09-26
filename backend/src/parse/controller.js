const pool = require("../../db");
const { Parser } = require("node-sql-parser/build/postgresql");
const { createHash } = require("node:crypto");
const cloneDeepWith = require("lodash/cloneDeepWith");
const noop = require('lodash/noop');
const { getAllHashedColumnsQuery, createHashedColumns } = require("./queries");

const parser = new Parser();

const parseSql = async (req, res) => {
  try {
    const { sql } = req.body;
    if (sql === "" || sql === undefined ) {
      res.status(200).json({modifiedSQL: ""});
      return;
    }

    const { columnList, ast } = parser.parse(sql);
    const columnMap = {};
    columnList.forEach((col) => {
      const split = col.split("::");
      if (split[2] !== "(.*)"){
        columnMap[split[2]] = createHash("sha256").update(split[2]).digest("hex");
      }
    });

    const updatedAst = cloneDeepWith(ast, (value) => {
      return value?.type === "column_ref" ? {...value, column: columnMap[value.column]} : noop();
    })
    updatedAst.forEach((updated, i) => {
      if (updated.type === "insert") {
        updatedAst[i].columns = updatedAst[i].columns.map((col) => (columnMap[col]));
      }
      if (updated.type === "update") {
        updatedAst[i].set = updatedAst[i].set.map((s) => ({...s, column: columnMap[s.column]}))
      }
    })
    

    const hashedColumns = Object.keys(columnMap).map(column => [column, columnMap[column]])

    await pool.query(createHashedColumns(hashedColumns));

    const body = {
      modifiedSQL: parser.sqlify(updatedAst),
      hashedColumns,
      ast,
    }


    res.status(200).json(body);
  } catch (e) {
    console.error(e);
    res.status(500).send("Failed");
  }
};

const getAllColumns = async (req, res) => {
  try {
    const results = await pool.query(getAllHashedColumnsQuery);
    res.status(200).json(results.rows.map(row => [row.column_name, row.column_hash]));
  } catch (e) {
    console.error(e);
    res.status(500).send("Failed to get hashed columns");
  }
}

module.exports = {
  parseSql,
  getAllColumns,
};
