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

async function getScheduledAppointmentsByPatientId(userId) {
  const [rows] = await db.query(
    "SELECT * FROM appointment WHERE patient_id = ? AND status = 'scheduled'",[userId]);
  return rows;  
}

async function getCompletedAppointmentByPatientId(userId) {
  const [rows] = await db.query(
    "SELECT * FROM appointment WHERE patient_id = ? AND status = 'completed'", [userId]
  );
  return rows;  
}

async function getBillingByPatientId(userId) {
  const [rows] = await db.query(
    "SELECT * FROM billing WHERE patient_id = ? ", [userId]
  );
  return rows;  
}

async function getAllStaffWithInfo() {
  const [rows] = await db.query(`
    SELECT ua.user_id, ua.username, ua.role, ua.created_at, 
           s.staff_id, s.name, s.position 
    FROM user_account ua 
    LEFT JOIN staff s ON ua.user_id = s.user_id 
    WHERE ua.role = 'Staff'
  `);
  return rows;
}

async function getStaffbyUserId(userId){
  const [rows] = await db.query(
    "SELECT * FROM user_account WHERE user_id = ? ", [userId]
  );
  return rows[0];  
}

module.exports = { getUserById,getPatientById, getScheduledAppointmentsByPatientId, getCompletedAppointmentByPatientId, getBillingByPatientId, getAllStaffWithInfo, getStaffbyUserId};
