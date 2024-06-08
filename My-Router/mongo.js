const express = require("express")
const mongoose = require("mongoose")
const bcrypt = require("bcrypt")
const { log } = require("console")
const router = express.Router()

router.use(express.urlencoded({ extended : true }))

//connecting MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/users")
.then(console.log(" Done ...>>>>>>>>>>"))

const userschema = new mongoose.Schema({
    username : String,
    email : String,
    password : String
})

const userModel = new mongoose.model("details",userschema);

function signin(req,res,next){
    if(req.session.isAuth){
        next()
    }else{
        res.redirect("/")
    }
} 

function ifLogged(req,res,next){
    if(req.session.isAuth){
        res.redirect("/home")
    }else{
        next()
    }
}

// Login page 
router.get("/",ifLogged, async(req,res) => {   
        res.render("Login")
})

// Sign up page
router.get("/signup",ifLogged, (req,res) => {
    res.render("signup")
})

// Login process
router.post("/Login", async(req,res) => {
    try{
        const data = await userModel.findOne({username : req.body.username})
        // console.log("userdata",data)
        const passwordMatch = await bcrypt.compare(req.body.password , data.password )
        if(passwordMatch){
            req.session.username = req.body.username
            req.session.password = req.body.password
            req.session.isAuth = true;
            res.redirect("/home")
        }else{
           res.render("Login",{perror : "Invalid Password"})
        }
    }catch{
        res.render("Login",{ unerror : "Invalid username"})
    }
})

// Sign-Up data collection
router.post("/sign",async(req,res) => {
    const emailexist = await userModel.findOne({email: req.body.email})
    // console.log(req.body.email)
    if(emailexist){
        res.render("signup",{emailexist : "E-mail already exist"})
    }else{
        const hashedpassword = await bcrypt.hash(req.body.password,10)
        // console.log(req.body.password)
        const {username , email , password} = req.body
        await userModel.insertMany( [ {
                username : username,
                email : email,
                password : hashedpassword
            } ] )
            res.redirect("/")
    }
});

router.get("/home",signin,(req,res) => {
        res.render("home")
});

router.get("/logout",(req,res) => {
    req.session.isAuth = false;
    req.session.destroy();
    res.redirect("/")
})
module.exports = {router,userModel};