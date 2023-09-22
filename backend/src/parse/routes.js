const { Router } = require("express");
const { parseSql } = require("./controller");

const router = Router();

router.post("/", parseSql);

module.exports = router;