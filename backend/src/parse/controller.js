const pool = require("../../db");
const { Parser } = require("node-sql-parser");
const { createHash } = require("node:crypto");
const cloneDeepWith = require("lodash/cloneDeepWith");
const noop = require('lodash/noop');
// const { getUsersQuery } = require("./queries");

const parser = new Parser();

const parseSql = async (req, res) => {
  try {
    const { sql } = req.body;

    const { columnList, ast } = parser.parse(sql);
    const columnMap = {};
    columnList.forEach((col) => {
      const split = col.split("::");
      columnMap[split[2]] = createHash("sha256").update(split[2]).digest("hex");
    });

    const updatedAst = cloneDeepWith(ast, (value) => {
      return value?.type === "column_ref" ? {...value, column: columnMap[value.column]} : noop();
    })

    // const results = await pool.query(getUsersQuery);

    const body = {
      modifiedSQL: parser.sqlify(updatedAst),
      columnHashMap: columnMap
    }


    res.status(200).json(body);
  } catch (e) {
    console.error(e);
    res.status(500).send("Failed");
  }
};

module.exports = {
  parseSql,
};
