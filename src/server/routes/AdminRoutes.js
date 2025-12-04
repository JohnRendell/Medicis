const express = require("express");
const app = express.Router();
const fs = require("fs");
const path = require("path");
const db = require("../config/db");
const bcrypt = require("bcrypt");

const {getAllStaffWithInfo, getStaffbyUserId} = require('../models/patient_session');

function LoginAuth(req, res, next) {
    if (!req.session.user) {
        return res.redirect('/');
    }
    next();
}
app.get('/loadstaffinfo', LoginAuth, async (req, res) => {
  try {
    const staffs = await getAllStaffWithInfo();

    res.json(staffs); 
  } catch (error) {
    console.error("Error loading staff info:", error);
    res.status(500).send('Server error');
  }
});

function createstaff_middleware(req, res, next){
    const { fullname, position, username, password } = req.body;

    if(!fullname || !position || !username || !password){
        return res.status(400).json({ success: false, message: "fields are empty."});
    }
    else if(username.length <= 4){
        return res.status(400).json({ success: false, message: "username must be five or above."})
    }
    else if(password.length <= 4){
        return res.status(400).json({ success: false, message: "password must be five or above."})
    }
    else if(position !== 'doctor' && position !== 'nurse') {
  return res.status(400).json({ success: false, message: "enter valid position" });
}
    next();
}

app.post('/createstaff', LoginAuth, createstaff_middleware, async (req, res) => {
  try { 
    const { username, password, fullname, position } = req.body; 
    
    const hash_pass = await bcrypt.hash(password, 10)

   
    const [account] = await db.query(
      "INSERT INTO user_account (username, password, role) VALUES (?, ?, ?)",
      [username, hash_pass, 'Staff']  
    );
    
    if (account.affectedRows === 0) {
      return res.status(400).json({ success: false, message: "User Account Creation Failed!" });
    }

    const newUserId = account.insertId; 
    
    const [staff_info] = await db.query(
      "INSERT INTO staff (name, position, user_id) VALUES (?, ?, ?)",
      [fullname, position, newUserId]
    );
    
    if (staff_info.affectedRows === 0) {
      return res.status(400).json({ success: false, message: "Staff Account Creation Failed!" });
    }

    res.status(201).json({ 
      success: true, 
      message: "Staff created successfully!",
      userId: newUserId,
      staffId: staff_info.insertId 
    });

  } catch (error) {
    console.error("Error creating staff:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/deletestaff/:userId', LoginAuth, async (req, res) => {
  try {
    const userId = req.params.userId;

    const [result] = await db.query(
      "DELETE FROM user_account WHERE user_id = ?",
      [userId]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Staff not found" });
    }
    
    res.json({ 
      success: true, 
      message: "Staff deleted successfully!" 
    });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});


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
        res.redirect('/');
    }
});







module.exports = app;