const db = require("../config/db");

async function getUserById(userId) {
  const [rows] = await db.query(
    "SELECT * FROM user_account WHERE user_id = ?",[userId]);
  return rows[0];  
}

async function getPatientById(userId) {
  const [rows] = await db.query(
    "SELECT * FROM patient WHERE user_id = ?",[userId]);
  return rows[0];  
}

// (async () => {
//   const patient = await getPatientById(1);
//   console.log(patient);
// })();

// node src/server/models/patient_session.js

async function getAppointmentstByPatientId(userId) {
  const [rows] = await db.query(
    "SELECT * FROM appointment WHERE patient_id = ?",[userId]);
  return rows;  
}


module.exports = { getUserById,getPatientById, getAppointmentstByPatientId };
