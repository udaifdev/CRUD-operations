const express = require("express");
const mongoose = require("mongoose")
const {userModel} = require("./mongo")
const bcrypt = require("bcrypt");
const { stringify } = require("querystring");
const { log } = require("handlebars");
const adrouter = express.Router();

adrouter.use(express.urlencoded({extended : true}));

// connecting mongoose
mongoose.connect("mongodb://127.0.0.1:27017/users").then(console.log("done"));
const userschema = new mongoose.Schema({
  username: {
    type : String
  },
  password: {
    type: String
  },
});
// creating model 
const adminsModel = new mongoose.model("admins", userschema);

// authentication checking function
function adsignin(req,res,next){
    if(req.session.isadAuth){
        next();
    }else{
        res.redirect("/admin");
    }
}

// first route
adrouter.get("/",async(req,res) => {
    if(req.session.isadAuth){
        res.redirect("/admin/adhome")
    }else{
        res.render("admin");
    }
})

//admin login route
adrouter.post("/adminlogin",async(req,res) => {
    try{
        // console.log(req.body.username)
        // const data = await adminsModel.find()
        // console.log(data)
        //email checking
        const data1 = await adminsModel.findOne({username:req.body.username})
        // const data1 = await adminsModel.findOne()
        console.log(data1,'data1.........>>>>>>>>>');

        // const data2 = await adminsModel.findOne({password :req.body.password})
        // console.log(data2,"data2");
         if(data1 && data1.username == req.body.username){
            if(data1.password == req.body.password){
                req.session.isadAuth = true ;
                res.redirect("/admin/adhome");
            }else{
                res.render("admin",{perror: "Invalid Password"})
            }
        } else{
            res.render("admin",{perror:"Invalid Username"})
        }
    } catch{
        const error = "bug is there please corroct it >>>>>>>>>>>>>>>>>>>"
        console.log(error)
    }
});

// admin logout route
adrouter.get("/adminlogout", (req,res) =>{
    req.session.isadAuth = false;
    req.session.destroy();
    res.redirect("/admin")
})

//admin adduser route
adrouter.route("/adduser").get(adsignin,(req,res) =>{
    res.render("adduser")
})


// admin aduser submission route
adrouter.post("/adusersubmit", adsignin,async(req,res) => {
    if(req.session.isadAuth){
        const emailexist = await userModel.findOne({email: req.body.email})
        if(emailexist){
            res.render("adduser",{emailsexit : "E-mail alredy exist"})
        }else{
            const {username,email,password} = req.body;
            const hashedpassword = await bcrypt.hash(req.body.password,10)
            await userModel.insertMany([
                { username : username, email: email, password : hashedpassword}
            ]);
            res.redirect("/admin/adhome")
        }
    }else{
        res.redirect("/admin");
    }
})

// admin home route
adrouter.route("/adhome").get(adsignin , async(req,res) => {
    if(req.session.isadAuth){
        const data = await userModel.find({ });
        res.render("adminpanel",{users : data})
    }else{
        res.redirect("/admin");
    }
})
.post(adsignin,async(req,res) => {
    if(req.session.isadAuth){
        const name = req.body.search;
        const data = await userModel.find({
            username :{$regex: new RegExp(name,"i")}
        })
        res.render("adminpanel",{users: data})
    } else {
        res.redirect("/admin");
    }
})


adrouter.get("/delete/:email", adsignin, async(req,res) =>{
    if(req.session.isadAuth){
        const userid = req.params.email;
        await userModel.deleteOne({email: userid});
        res.redirect("/admin/adhome");
    } else {
        res.redirect("/admin/adhome")
    }
});
adrouter.get("/update/:email", adsignin, async(req,res) => {
    if(req.session.isadAuth){
        const useremail = req.params.email;
        const user = await userModel.findOne({email: useremail})
        res.render("update", {data : user});
    } else{
        res.redirect("/admin")
    }
})
adrouter.post("/update/:email",adsignin,async(req,res) =>{
    if(req.session.isadAuth){
        const useremail = req.params.email;
        const user = await userModel.findOne({email:useremail})
        const emailexist = await userModel.findOne({$and:[{email:req.body.email},{email:{$ne:useremail}}]})
        if(emailexist){
            res.render("update",{date:user,emailsexit:"Email already exists"})
        }else{
            await userModel.updateOne({
                email:useremail
            },{
                username: req.body.username,
                email: req.body.email
            })
            res.redirect("/admin/adhome")
        }
    }else{
        res.redirect("/admin");
    }
});

module.exports = adrouter;