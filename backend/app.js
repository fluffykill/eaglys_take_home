const express = require('express');
const parseRouter = require('./src/parse/routes');

const app = express();

app.use(express.json());

app.use("/api/parse", parseRouter);

module.exports = app;