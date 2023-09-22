const express = require('express');
const dotenv = require('dotenv');
const parseRouter = require('./src/parse/routes');

dotenv.config();

const app = express();
const port = process.env.PORT;

app.use(express.json());

app.use("/api/parse", parseRouter);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
})