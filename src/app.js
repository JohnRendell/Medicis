const express = require("express");
const app = express();
const { createServer } = require("http");
const expressServer = createServer(app);
// node src/app.js
app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));



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
    res.sendFile(path.join(__dirname, "public", "pages", "User", "Info_Dashboard.html"));

});

//routers
//-->

let port = 8080
expressServer.listen(port, ()=>{
    console.log("Listening to port " + port)
})