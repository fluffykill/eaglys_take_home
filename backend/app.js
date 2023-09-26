const express = require('express');
const dotenv = require('dotenv');
const parseRouter = require('./src/parse/routes');

dotenv.config();

const app = express();

app.use(express.json());

app.use("/api/parse", parseRouter);

module.exports = app;