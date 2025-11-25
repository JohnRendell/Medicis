const mysql = require("mysql2");

const config = mysql.createConnection({
    host: "localhost",
    user: "admin",
    password: "admin",
    database: "healthcare_db"
})

const database = config.promise()

module.exports = database;