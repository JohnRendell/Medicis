const express = require("express");
const app = express();
const { createServer } = require("http");
const expressServer = createServer(app);
const path = require("path");
const session = require('express-session');


// node src/app.js
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: "mysecretkey",    
    resave: false,   
    saveUninitialized: true,  
    cookie: { maxAge: 300000 } ,
    name: 'connect.sid'
}));

//serve folders

/**
 * Mga lods, dito pre since naka serve na yung public folder, pag mag co connect kayo ng css sa front end like
 * link href = "../style.css", magiging ganto sya link href = "/public/style.css". Same goes sa images src and file redirect
 * sa anchor tag
 */
app.use("/public", express.static(path.join(__dirname, "public")))

//database
const db = require("./server/config/db");

(async () => {
    try {
        await db.query("SELECT 1");
        console.log("Connected to MySQL!");
    } catch (err) {
        console.error("Database connection failed:", err);
    }
})();


//entry point
app.get("/", (req, res)=>{
    res.sendFile(path.join(__dirname, "public", "pages", "login.html"));
});

//routers
app.use("/pages", require("./server/page_route"))
app.use("/patients", require("./server/routes/patientRoutes"));

let port = 8080
expressServer.listen(port, ()=>{
    console.log("Listening to port " + port)
})