const express = require("express");
const app = express.Router();
const db = require("../config/db");

app.get("/display-appointment", async (req, res)=>{
    try{
        if(!req.session.isStaff){
            return redirect("/redirect/dashboard")
        }

        const [appointment_tbl] = await db.query(
            "SELECT * FROM appointment"
        )

        if(appointment_tbl.length > 0){
            const map = appointment_tbl.map((data) => ({
                appointment_id: data.appointment_id,
                status: data.status,
                patient_id: data.patient_id,
                appointment_time: data.appointment_time
            }));
            return res.status(200).json({ success: true, message: "Retrieve appointment data success", data: map })
        }
        return res.status(404).json({ success: false, message: "No appointments yet" })
    }
    catch(err){
        return res.status(500).json({ success: false, message: "Internal Server", logs: err })
    }
});

app.get("/display-billing", async (req, res)=>{
    try{
        if(!req.session.isStaff){
            return redirect("/redirect/dashboard")
        }

        const [billing_tbl] = await db.query(
            "SELECT * FROM billing"
        )

        if(billing_tbl.length > 0){
            const map = billing_tbl.map((data) => ({
                billing_id: data.billing_id,
                amount_paid: data.amount_paid,
                patient_id: data.patient_id,
                appointment_id: data.appointment_id,
                amount_due: data.amount_due,
                due_date: data.due_date,
                status: data.status
            }));
            return res.status(200).json({ success: true, message: "Retrieve appointment data success", data: map })
        }
        return res.status(404).json({ success: false, message: "No appointments yet" })
    }
    catch(err){
        return res.status(500).json({ success: false, message: "Internal Server", logs: err })
    }
});

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

app.patch("/set_status", async (req, res)=>{
    try{
        const [set_status] = await db.query(
            "UPDATE billing SET status = ? WHERE billing_id = ?", [req.body.status, req.body.id]
        )

        if(set_status.affectedRows > 0){
            return res.status(200).json({ success: true, message: "success" })
        }
        return res.status(400).json({ success: false, message: "invalid" })
    }
    catch(err){
        console.log(err)
        return res.status(500).json({ success: false, message: err })
    }
})

module.exports = app;