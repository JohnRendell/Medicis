const express = require("express");
const app = express();
const { createServer } = require("http");
const expressServer = createServer(app);
const path = require("path");
const session = require('express-session');


// node src/app.js
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(express.static(path.join(__dirname, "public")));

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


app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "pages", "login.html"));
});

//routers
app.use("/redirect", require("./server/page_routes")) //->> 
// dito pre yung mga usual pages natin like login, dashboard, sign in etc, 
// nag lagay din ako ng safeguard since yung mga routes dito is 'get', 
// pwede kang maredirect pero since may safe guard na, ire redirect sa root page pag invalid, 
// halimbawa: /redirect/dashboard -> goes to user pero since di naman nag route via login, 
// ire redirect dito yung root page.

app.use("/user", require("./server/routes/userRoutes")); //->>
//dito naman yung sa routing natin like post, patch, put, delete basically yung usual api natin.

app.use("/patients", require("./server/routes/patientRoutes")); //->>
//same as above dito

//404 page -- pre eto yung invalid page, so kunwari nag type si user ng /redirect/test 
// or any other route na di nage exist, ire redirect sa 404 page. Gumawa pala ako ng html file non, 
// i design nalang nila Jerome
app.use((req, res)=>{
    res.status(404).sendFile(path.join(__dirname, "./public/pages/404page.html"));
})

let port = 8080
expressServer.listen(port, ()=>{
    console.log("Listening to port " + port)
})