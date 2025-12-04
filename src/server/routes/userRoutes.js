const express = require("express");
const router = express.Router();
const db = require("../config/db");
const bcrypt = require("bcrypt");

function register1_middleware(req, res, next){
    const { username, password, confirm_pass } = req.body;

    if(!username || !password || !confirm_pass){
        return res.status(400).json({ success: false, message: "fields are empty."});
    }
    else if(username.length <= 4){
        return res.status(400).json({ success: false, message: "username must be five or above."})
    }
    else if(password.length <= 4){
        return res.status(400).json({ success: false, message: "password must be five or above."})
    }
    else if(password !== confirm_pass){
        return res.status(400).json({ success: false, message: "passwords don't match."})
    }
    next();
}

function register2_middleware(req, res, next) {
    const { name, gender, date, address, email, phone_num } = req.body;

    if (!name || !gender || !date || !address || !email || !phone_num) {
        return res.status(400).json({ success: false, message: "Fields cannot be empty" });
    }

    if (name.length < 5) {
        return res.status(400).json({ success: false, message: "Name must be at least 5 characters" });
    }

    const gen = String(gender).toUpperCase();
    if (gen !== "MALE" && gen !== "FEMALE") {
        return res.status(400).json({ success: false, message: "Please enter male or female" });
    }

    const birthday = new Date(date);
    if (isNaN(birthday.getTime())) {
        return res.status(400).json({ success: false, message: "Invalid date format" });
    }

    const today = new Date();
    if (birthday >= today) {
        return res.status(400).json({ success: false, message: "Birthday cannot be in the future" });
    }

    function getAge(born, today) {
        let age = today.getFullYear() - born.getFullYear();
        const m = today.getMonth() - born.getMonth();
        const d = today.getDate() - born.getDate();

        if (m < 0 || (m === 0 && d < 0)) age--;
        return age;
    }

    const age = getAge(birthday, today);

    if (age <= 0 || age >= 120) {
        return res.status(400).json({ success: false, message: "Age is not valid" });
    }

    if (address.length < 5) {
        return res.status(400).json({ success: false, message: "Address must be at least 5 characters" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ success: false, message: "Enter a valid email" });
    }

    if (phone_num.length < 5) {
        return res.status(400).json({ success: false, message: "Phone number must be at least 5 characters" });
    }

    req.session.additionalData = { age };
    next();
}

router.post("/register1", register1_middleware, async (req, res)=>{
    try{
        const [check_account] = await db.query(
            "SELECT * FROM user_account WHERE username = ?", [req.body.username]
        )

        if(check_account.length > 0){
            return res.status(400).json({ success: false, message: "Username is already taken"});
        }
        
        req.session.registerData = {
            username: req.body.username,
            password: req.body.password
        };
        res.status(200).json({ success: true, message: "register 1 succeed", redirect: "/redirect/create-account-part-2" })
    }
    catch(err){
        return res.status(500).json({ success: false, message: "Internal Server Error", logs: err})
    }
});

router.post("/register2", register2_middleware, async (req, res) => {
    try {
        const data = req.session.registerData;

        if (!data || !data.username || !data.password) {
            return res.status(400).json({ success: false, message: "Session expired. Please restart registration." });
        }

        const hash_pass = await bcrypt.hash(data.password, 10);

        const [result] = await db.query(
            "INSERT INTO user_account (username, password) VALUES (?, ?)",
            [data.username, hash_pass]
        );

        if (result.affectedRows === 0) {
            return res.status(400).json({ success: false, message: "User creation failed." });
        }

        const user_id = result.insertId;

        const { name, gender, date, address, email, phone_num } = req.body;
        const age = req.session.additionalData?.age;

        if (age === undefined) {
            return res.status(500).json({ success: false, message: "Session error: age missing." });
        }

        const [register_to_patient] = await db.query(
            "INSERT INTO patient (name, email, phone, date_of_birth, address, user_id, sex, age) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            [name, email, phone_num, date, address, user_id, gender, age]
        );

        if (register_to_patient.affectedRows > 0) {
            return res.status(200).json({
                success: true,
                message: "Registration successful",
                redirect: "/"
            });
        }

        return res.status(400).json({ success: false, message: "Registration failed, please try again" });

    } catch (err) {
        return res.status(500).json({ success: false, message: "Internal Server Error", logs: err });
    }
});

module.exports = router;