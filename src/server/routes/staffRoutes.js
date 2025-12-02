const express = require("express");
const app = express.Router();
const db = require("../config/db");

app.get("/staff_info", async (req, res)=>{
    try{
        const authenticatedUser = req.session.user
        let isValid =  req.session.isValid

        if(isValid){
            if(authenticatedUser.role !== "Staff"){
                return res.status(400).json({ success: false, message: "You are not a staff", redirect: "/patients/dashboard"});
            }

            const [get_info] = await db.query(
                "SELECT * FROM staff WHERE user_id = ?", [authenticatedUser.user_id]
            )

            if(get_info.length > 0){
                let name;
                switch(get_info[0].position){
                    case "doctor":
                        name = "Dr. "
                        break

                    case "nurse":
                        name = "RN. "
                        break
                }

                get_info[0].name = name + get_info[0].name
                return res.status(200).json({ success: true, message: "Success", data: get_info[0] })
            }
            return res.status(404).json({ success: false, message: "User id is invalid" })
        }
        return res.redirect("/")
    }
    catch(err){
        console.log(err)
        return res.status(500).json({ success: false, message: err })
    }
});

app.post("/search-patient-id", async (req, res)=>{
    try{
        const [query] = await db.query(
            "SELECT * FROM patient WHERE patient_id = ?", [req.body.user_id]
        )

        if(query.length > 0){
            function formatDate(d) {
                const year = d.getFullYear();
                const month = String(d.getMonth() + 1).padStart(2, "0");
                const day = String(d.getDate()).padStart(2, "0");
                return `${year}/${month}/${day}`;
            }
            query[0].date_of_birth = formatDate(query[0].date_of_birth)

            return res.status(200).json({ success: true, message: "user exist", data: query[0] })
        }
        return res.status(404).json({ success: false, message: "user not exist" })
    }
    catch(err){
        return res.status(500).json({ success: false, message: "Internal Server Error" })
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
        // If no session exists, just redirect
        res.redirect('/');
    }
});

module.exports = app;