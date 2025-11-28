const express = require("express");
const app = express.Router();
const fs = require("fs");
const path = require("path");
const db = require("../config/db");
const bcrypt = require("bcrypt");
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
    
  try {
    
    const userId = req.session.user.user_id;
    const patient_info = await getPatientById(userId); 
    res.json(JSON.parse(JSON.stringify(patient_info)));

  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});
// update patient info
app.patch('/update-patient-info', LoginAuth, async (req, res) => {
    const userId = req.session.user_id; 
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

module.exports = app;