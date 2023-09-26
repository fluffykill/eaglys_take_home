const { Router } = require("express");
const { parseSql, getAllColumns } = require("./controller");

const router = Router();

router.post("/", parseSql);
router.get("/", getAllColumns);

module.exports = router;