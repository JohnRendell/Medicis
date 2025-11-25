const express = require("express");
const app = express();
const { createServer } = require("http");
const expressServer = createServer(app);

app.use(express.json());

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
app.use("/", (req, res)=>{
    res.send("Server is alive") //--> palitan ito ng index.html, bale dito ise serve yung entry point ng website
})

//routers
//-->

let port = 8080
expressServer.listen(port, ()=>{
    console.log("Listening to port " + port)
})