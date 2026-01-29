
const express = require('express')
const bcrypt = require('bcrypt')
const saltRounds = 10
const router = express.Router()
const db = require('../helpers/db'); // your database module


router.get("/login", (req, res) => {
    res.render("login")
})

router.get("/register", (req, res) => {
    res.render("register")
})

router.post("/login", async (req, res) => {

    logInInfo = {
        "username": req.body.username,
        "password" : req.body.password
    }

    // console.log(logInInfo)

    // Call db function to authenticate user
    const userObj = await db.authenticateUser(logInInfo)
    // console.log(userObj)

    if (userObj.success) {
        // const pdfsResult = await db.getPDFs(userObj.user._id)
        // const pdfs = pdfsResult.filenames

        // console.log("Here: ", pdfs)

        // Add User to Session upon successfull authentication
        req.session.user = {
            id: userObj.user._id,
            firstname: userObj.user.firstname,
            lastname: userObj.user.lastname,
            username: userObj.user.username,
            pdfs: []
        }

        req.session.loggedIn = true
        res.redirect("/")

    } else {
        console.log("Do not have account. Please Create One.")
        res.render("login", { alertMessage: "Log In Failed."} )
    }

})

router.get('/logout', (req, res) => {
    if (!req.session.loggedIn) {
        return res.status(200).send("Not Logged In. <a href='/login'>Log In</a>");
    }

    console.log("Logged Out")
    req.session.destroy()
    res.redirect("/")
})


router.post("/register", async (req, res) => {

    let plainTextPassword = req.body.password;
    bcrypt.hash(plainTextPassword, saltRounds, async (err, hash) => {
        createAccountInfo = {
            firstname: `${req.body.firstname}`,
            lastname: `${req.body.lastname}`,
            username : `${req.body.username}`, 
            email : `${req.body.email}`, 
            password : hash
        }

        // Call db function to add User to db
        const addUser = await db.createUser(createAccountInfo)

        if (addUser.success) {
            res.render("login", { alertMessage: addUser.message})
        } else {
            res.render("register", { alertMessage: addUser.err})
        }

    });

    
})

module.exports = router;
