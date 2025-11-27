const mysql = require("mysql2");

const config = mysql.createConnection({
     host: "localhost",
     user: "admin",
     password: "admin",
     database: "healthcare_db"
})

/*
const config = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'healthcare_db'
})
*/

const database = config.promise()

module.exports = database;