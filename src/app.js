import pool from './server/config/db.js';

const result = await pool.query("SELECT * FROM user_account")

console.log(result)
//  SIMPLE QUERY TO SEE IF THE DATABASE IS WORKING