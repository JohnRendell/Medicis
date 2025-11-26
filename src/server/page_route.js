const express = require("express");
const router = express.Router();
const path = require("path");
const db = require("./config/db");
const bcrypt = require("bcrypt");

function register1_middleware(req, res, next){
    const { username, password, confirm_pass } = req.body;

    if(username.length <= 4){
        res.status(400).redirect("/pages/register1?error=username-length");
        return
    }
    else if(password.length <= 4){
        res.status(400).redirect("/pages/register1?error=pass-length");
        return
    }
    else if(password !== confirm_pass){
        res.status(400).redirect("/pages/register1?error=pass-didnt-match");
        return
    }
    next();
}

function register_account_middleware(req, res, next){
    const { name, address, phone_num } = req.body
    
    if(name.length <= 4){
        res.status(400).redirect("/pages/register2?error=name-length");
        return
    }

    if(address.length <= 4){
        res.status(400).redirect("/pages/register2?error=address-length");
        return
    }

    if(phone_num.length <= 4){
        res.status(400).redirect("/pages/register2?error=phone-num");
        return
    }

    next()
}

async function login_account_middleware(req, res, next){
    try{
        const [result] = await db.query(
            "SELECT * FROM user_account WHERE username = ?", [req.body.username]
        )

        if(result.length <= 0){
            res.status(400).redirect("/?error=invalid-username-or-password");
            return
        }

        const compare_pass = await bcrypt.compare(req.body.password, result[0].password);

        if(!compare_pass){
            res.status(400).redirect("/?error=invalid-username-or-password");
            return
        }
        next();
    }
    catch(err){
        console.log(err);
        res.status(500).send("Internal Server Error: \n" + err)
    }
}

router.get("/register1", (req, res)=>{
    res.status(200).sendFile(path.join(__dirname, "../public/pages/register1.html"))
});

router.post("/register2", register1_middleware, async (req, res)=>{
    try{
        const [check_account] = await db.query(
            "SELECT * FROM user_account WHERE username = ?", [req.body.username]
        )

        if(check_account.length > 0){
            res.status(400).redirect("/pages/register1?error=username-already-taken");
            return
        }
        req.session.registerData = {
            username: req.body.username,
            password: req.body.password
        };
        res.status(200).sendFile(path.join(__dirname, "../public/pages/register2.html"))
    }
    catch(err){
        console.log(err);
        res.status(500).send("Internal Server: \n" + err)
    }
});

router.post("/register_account", register_account_middleware, async (req, res)=>{
    try{
        const hash_pass = await bcrypt.hash(req.session.registerData.password, 10)
        const [result] = await db.query(
            "INSERT INTO user_account (username, password) VALUES (?, ?)", [req.session.registerData.username, hash_pass]
        )

        if(result.affectedRows > 0){
            res.status(200).sendFile(path.join(__dirname, "../public/pages/login.html"))
            return 
        }
        res.status(400).redirect("/pages/register2?error=account-registration-invalid");
    }
    catch(err){
        console.log(err);
        res.status(500).send("Internal Server Error")
    }
});

router.post("/dashboard", login_account_middleware, async (req, res)=>{
    res.redirect("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
    //res.status(200).sendFile(path.join(__dirname, "../public/pages/User/Info_Dashboard.html"));
});

module.exports = router;