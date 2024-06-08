const express = require("express")
const session = require("express-session")
const adminrouter = require("./My-Router/admin")
const { router } = require("./My-Router/mongo")
const nocache = require("nocache");
const path = require("path");
const { readFile } = require("fs");
const app = express();

// view engine
app.set("view engine","hbs");
app.use(express.static(__dirname + "/public") );
app.use(express.urlencoded({extended : true}))

// app.use(function (req, res, next) {
//         res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
//         res.header('Expires', '-1');
//         res.header('Pragma', 'no-cache');
//         next()
//     });


// initialzati nocache middleware

const nocacheMiddle = nocache();
//use nocache 
app.use(nocacheMiddle);
app.use(
    session({
        secret : "xxxyy>>>>>>xxxxxxx",
        resave : false,
        saveUninitialized: true,
    })
)

// router connect
app.use("/", router)
app.use("/admin", adminrouter)

app.get("*", (req,res) => {
    res.status(404).send("page is not founded")
})
 

// Host Port 
app.listen(3030, () => {
    console.log("Server is running at http://localhost:3030");
});
