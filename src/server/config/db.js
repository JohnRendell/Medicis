const mysql = require("mysql2");
const path = require("path");

const env_path = path.join(process.cwd(), "keys.env");
require("dotenv").config({ path: env_path });

const config = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASS,
    database: process.env.DATABASE
})


const database = config.promise()

module.exports = database;