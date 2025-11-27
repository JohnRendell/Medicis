const express = require("express");
const app = express.Router();
const fs = require("fs");

// PATIENT PAGESSSSSSSSSS --------------------------------------------------- 

const { getUserById, getPatientById } = require('../models/patient_session');


// if not logged in then redirect to login page
function LoginAuth(req, res, next) {
    if (!req.session.user) {
        return res.redirect('/');
    }
    next();
}
// Validates that the role is User
function userOnly(req, res, next) {
    if (req.session.user.role !== 'User') {
        return res.status(403).send("Access denied"); // not an admin
    }
    next();
}

app.post('/login', async (req, res) => {

  try {
    // naka default pa na user_id 1 yung kukunin dito para pang testing kasi ginagawa pa den ung login/register e
   const user_session = await getUserById(1);
    if (!user_session) {
      return res.status(404).send('User not found');
    }
    req.session.user = {
      id: user_session.user_id,
      username: user_session.username,
      role: user_session.role
    };

    res.redirect('/patientinfo');
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});


app.get("/patientinfo", LoginAuth, userOnly , (req, res)=>{
    res.sendFile(path.join(__dirname, "public", "pages", "User", "Info_Dashboard.html"));
});
app.get("/appointment", LoginAuth, userOnly , (req, res)=>{
    res.sendFile(path.join(__dirname, "public", "pages", "User", "Appointment Dashboard.html"));
});
app.get("/billing", LoginAuth, userOnly , (req, res)=>{
    res.sendFile(path.join(__dirname, "public", "pages", "User", "Billing_Receipt_Dashboard.html"));
});

// PANG TEST LANG MAG LOG IN NG USER KASI GINAGAWA NI RENDELL YUNG SA LOGIN/REGISTER E
app.get('/login', (req, res) => {
  res.send(`
    <form action="/login" method="POST">
      <button type="submit">Login as TestUser</button>
    </form>
  `);
});

// kuha ng info ng patients para malagay sa may info_dashboard.html
app.get('/loadpatientinfo', LoginAuth, async (req, res) => {
    
  try {
    
    const userId = req.session.user.id;
    const patient_info = await getPatientById(userId); 
    res.json(JSON.parse(JSON.stringify(patient_info)));

  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});
// update patient info
app.patch('/update-patient-info', LoginAuth, async (req, res) => {
    const userId = req.session.user.id; 
    const updatedData = req.body; 
    console.log("Updated Data:", updatedData);
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


const result = await db.query(query, values);
res.status(200).json({ message: 'Patient information updated successfully' });
 } catch (error) {
console.error('Error updating patient info:', error);
 res.status(500).json({ message: 'Failed to update patient information' });
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
// --------------------------------------------------- END OF PATIENT PAGES

module.exports = app;