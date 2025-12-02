const express = require("express");
const app = express.Router();
const fs = require("fs");
const path = require("path");
const db = require("../config/db");
const bcrypt = require("bcrypt");
// PATIENT PAGESSSSSSSSSS --------------------------------------------------- 

const { getUserById, getPatientById, getAppointmentstByPatientId } = require('../models/patient_session');


// if not logged in then redirect to login page
function LoginAuth(req, res, next) {
    if (!req.session.user) {
        return res.redirect('/');
    }
    next();
}

//validate edit information
function validate_edit_info(req, res, next){
  const { name, sex, date_of_birth, address, email, phone } = req.body

  if(!name || !sex || !date_of_birth || !address || !email || !phone){
    res.status(400).json({ success: false, message: "Fields are empty" });
    return
  }

  if(name.length <= 4){
    res.status(400).json({ success: false, message: "name must be five above" });
    return
  }

  const birthday = new Date(date_of_birth);
  if (isNaN(birthday.getTime())) {
      return res.status(400).json({ success: false, message: "Invalid date format" });
  }

  if (birthday >= new Date()) {
      return res.status(400).json({ success: false, message: "Birthday cannot be in the future" });
  }

  function getAge(born, today) {
        let age = today.getFullYear() - born.getFullYear();
        const m = today.getMonth() - born.getMonth();
        const d = today.getDate() - born.getDate();

        if (m < 0 || (m === 0 && d < 0)) age--;
        return age;
    }

  const age = getAge(birthday, new Date());

  if (age < 0 || age > 120) {
      return res.status(400).json({ success: false, message: "Age is not valid" });
  }

  if (address.length < 5) {
      return res.status(400).json({ success: false, message: "Address must be at least 5 characters" });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: "Enter a valid email" });
  }

  if (phone.length < 5) {
      return res.status(400).json({ success: false, message: "Phone number must be at least 5 characters" });
  }
  req.session.additionalData = { age };
  next();
}

// Validates that the role is User
function userOnly(req, res, next) {
    if (req.session.user.role !== 'User') {
        return res.status(403).send("Access denied"); // not an admin
    }
    next();
}

async function login_account_middleware(req, res, next){
    try{
        // 1. Query the database to retrieve user credentials and role/ID
        const [result] = await db.query(
            "SELECT user_id, username, password, role FROM user_account WHERE username = ?",
            [req.body.username]
        );
        
        const userRecord = result[0];

        if(result.length <= 0){
            return res.status(400).json({ success: false, message: "Invalid username or password"});
        }

        // 2. Compare password using bcrypt
        const compare_pass = await bcrypt.compare(req.body.password, userRecord.password);

        if(!compare_pass){
            return res.status(400).json({ success: false, message: "Invalid username or password"});
        }

        const { password, ...userData } = userRecord; 
        req.user = userData; 

        next();
    }
    catch(err){
        console.error("!!! MIDDLEWARE CRASHED !!!", err);
        return res.status(500).json({ success: false, message: "Internal Server Error during authentication", logs: err.message})
    }
} 

app.post('/login', login_account_middleware, async (req, res) => {
    
    try {
        const authenticatedUser = req.user;
        
        req.session.user = {
            user_id: authenticatedUser.user_id,
            username: authenticatedUser.username,
            role: authenticatedUser.role
        };

        console.log(authenticatedUser.role)

        if(authenticatedUser.role == "Staff"){
          console.log("I am staff")
          req.session.isStaff = true
        }


        req.session.isValid = true
        res.status(200).json({ success: true, message: "Login successful", redirect: "/redirect/dashboard"});
    } catch (error) {
        console.error("Session establishment failed:", error);
        res.status(500).json({ 
            success: false, 
            message: "Server error during session establishment.",
            logs: error.message
        });
    }
});


// kuha ng info ng patients para malagay sa may info_dashboard.html
app.get('/loadpatientinfo', LoginAuth, async (req, res) => {
  function getAge(dobString) {
    const dob = new Date(dobString);
    const today = new Date();

    let age = today.getFullYear() - dob.getUTCFullYear();

    return age;
  }

  function formatDate(dobString) {
    const d = new Date(dobString);

    const year = d.getUTCFullYear();
    const month = String(d.getUTCMonth() + 1).padStart(2, "0");
    const day = String(d.getUTCDate() + 1).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }
    
  try {
    
    const userId = req.session.user.user_id;
    const patient_info = await getPatientById(userId); 

    patient_info.age = getAge(patient_info.date_of_birth)
    patient_info.date_of_birth = formatDate(patient_info.date_of_birth)

    res.json(JSON.parse(JSON.stringify(patient_info)));

  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

// update patient info
app.patch('/update-patient-info', LoginAuth, validate_edit_info, async (req, res) => {
    const userId = req.session.user.user_id; 
    const updatedData = req.body; 
    updatedData.age = req.session.additionalData?.age

    try {
        const query = `
            UPDATE patient
            SET 
                name = COALESCE(?, name),
                sex = COALESCE(?, sex),
                age = COALESCE(?, age),
                date_of_birth = COALESCE(?, date_of_birth),
                address = COALESCE(?, address),
                email = COALESCE(?, email),
                phone = COALESCE(?, phone)
            WHERE user_id = ?;
        `;

        const values = [
            updatedData.name,
            updatedData.sex,
            updatedData.age,
            updatedData.date_of_birth,
            updatedData.address,
            updatedData.email,
            updatedData.phone,
            userId
        ];


    const [result] = await db.query(query, values);

    if(result.affectedRows > 0){
      const [updated_data] = await db.query(
        "SELECT * FROM patient WHERE user_id = ?", [userId]
      )

      if(updated_data.length > 0){
        let data = updated_data[0];

        function formatDate(dobString) {
          const d = new Date(dobString);

          const year = d.getUTCFullYear();
          const month = String(d.getUTCMonth() + 1).padStart(2, "0");
          const day = String(d.getUTCDate() + 1).padStart(2, "0");

          return `${year}-${month}-${day}`;
        }

        const map = {
          name: data.name,
          sex: data.sex,
          age: data.age,
          date_of_birth: formatDate(data.date_of_birth),
          address: data.address,
          email: data.email,
          phone: data.phone,
          patient_id: data.patient_id,
          user_id: data.user_id
        }

        res.status(200).json({ success: true, message: 'Patient information updated successfully', patientData: map });
        return
      }
      res.status(400).json({ success: false, message: "failed to fetch updated info"})
      return
    }

    res.status(400).json({ success: false, message: 'Failed to update patient information' });
  } catch (error) {
  console.error('Error updating patient info:', error);
    res.status(500).json({ success: false, message: "Internal Server Error", logs: error });
  }
});

app.get('/loadappointmentinfo', LoginAuth, async (req,res) =>{
  try {
    const userId = req.session.user.user_id;
    const patient_info = await getPatientById(userId); 
    const patient_id = patient_info.patient_id; 
    const patient_appointments = await getAppointmentstByPatientId(patient_id);
    
    res.json(patient_appointments);
    
} catch(error) {
    console.error("Error loading appointment info:", error);
    res.status(500).send('Server error');
}
});


app.post('/createappointment', LoginAuth, async (req,res) =>{
 
  try {
    const userId = req.session.user.user_id;
    const patient_info = await getPatientById(userId); 
    const patient_id = patient_info.patient_id; 


        const { appointment_datetime } = req.body;

const [result] = await db.query(
  "INSERT INTO appointment (patient_id, appointment_time) VALUES (?, ?)",
  [patient_id, appointment_datetime]
);

res.status(201).json({ 
  message: 'Appointment created successfully.', 
  appointment: result.insertId
  
});

        
} catch(error) {
    console.error("Error Creating Appointment:", error);
    res.status(500).send('Server error');
}
});

// LOGOUT ROUTE
app.get('/logout', (req, res) => {
    if (req.session) {
        req.session.destroy(err => {
            if (err) {

                console.error("Error destroying session:", err);
                return res.status(500).send('Could not log out.');
            }


            res.clearCookie('connect.sid'); 
            res.redirect('/'); 
        });
    } else {
        // If no session exists, just redirect
        res.redirect('/');
    }
});

module.exports = app;