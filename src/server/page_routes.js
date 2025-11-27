const express= require("express");
const router = express.Router();
const path = require("path");

router.get("/create-account-part-1", (req, res)=>{
    return res.status(200).sendFile(path.join(__dirname, "../public/pages/register1.html"))
});

router.get("/create-account-part-2", (req, res) => {
    const data = req.session.registerData;

    if (data && data.username && data.password) {
        return res.sendFile(path.join(__dirname, "../public/pages/register2.html"));
    }

    return res.redirect("/redirect/create-account-part-1");
});

router.get("/dashboard", (req, res)=>{
    let isValid =  req.session.isValid

    if(isValid){
        return res.sendFile(path.join(__dirname, "../public/pages/User/info_Dashboard.html"));
    }
    return res.redirect("/");
});

module.exports = router