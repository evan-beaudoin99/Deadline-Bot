
const express = require('express')
const path = require('path')
const session = require("express-session")
const MongoStore = require('connect-mongo').default;

const {db, helpers, executePython} = require('./helpers/index')


const app = express()
const PORT = 3000

db.startServer()

app.set("view engine", "pug")
app.set("views", path.join(__dirname, "./views"))

app.use(express.static(path.join(__dirname, './client/')))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Creates a new session
app.use(session({
    secret: 'deadlinebot3000',
    resave: false, 
    saveUninitialized: true,
    store: MongoStore.create({
        mongoUrl: 'mongodb://localhost:27017/deadline',
        collectionName: 'sessions',
        ttl: 14 * 24 * 60 * 60,
        autoRemove: 'interval',
        autoRemoveInterval: 10
    })
}))

app.use(async (req, res, next) => {
    res.locals.session = req.session
    if (req.session.user) {
        req.session.user.pdfs = await db.getPDFs(req.session.user.id)
    }
    console.log(req.session)
    next()
})

const authRouter = require("./routes/auth")
const uploadRouter = require("./routes/upload")

app.use('/upload', uploadRouter)
app.use('/', authRouter)

app.get("/", (req, res) => {
    res.render("home")
})

app.get("/data", async (req, res) => {

    if (!req.session.user) { // If no session redirect to login page
        console.log("Log In Again, no session")
        res.render("login", {alertMessage: "Session Lost. Please Log In Again"})
        return
    }

    const doc = await db.getCourseData(req.session.user.id)

    if (!doc.success) {
        res.render("home", {alertMessage: doc.message})
    } else {

        console.log("Course Data: ", doc.courses)

        res.render("summary", {courses: doc.courses})
    }

})

app.post("/summarize", async (req, res) => {

    console.log("PDF INFO: ", req.body.pdf_id)


    const summaryInfo = {
        user_id: req.session.user.id,
        pdf_id: req.body.pdf_id
    }

    try {
        const result = await executePython.summarize(summaryInfo)

        res.render("home", {alertMessage: "Finished Processing Course Data", success: true})

    } catch (error) {
        res.render("home", {alertMessage: "Execution Failed", success: false})

    }

})

app.post("/remove-pdf", async (req, res) => {
    const {userId, pdfId} = req.body

    await db.removePdf(userId, pdfId);

    req.session.user.pdfs = await db.getPDFs(req.session.user.id) // Update Session
    
    res.send("Success")
})


app.post("/start-emailer", async (req, res) => {
    res.send("Coming Soon")
})


app.listen(PORT, () => console.log(`Listening on port ${PORT}`))