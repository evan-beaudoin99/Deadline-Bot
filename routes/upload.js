const express = require("express");
const upload = require("../helpers/getData");
// const db = require('../helpers/db')

// const helpers = require('../helpers/helpers')

const {db, helpers} = require('../helpers/index')


const router = express.Router();

router.post('/', upload.single("pdf"), async (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded");
  }

  if (!req.session.user) { // If no session redirect to login page
    console.log("Log In Again, no session")
    res.render("login", {alertMessage: "Session Lost. Please Log In Again"})
    return
  }

  const file = req.file

  const result = await db.uploadPDF(req.session.user.id, file)

  req.session.user.pdfs = await db.getPDFs(req.session.user.id)

  console.log(result.pdfId)

  // helpers.summarizePdfRequest(req.session.user.id, result.pdfId)
   
  

  res.render("home", {alertMessage: result.message})
});




module.exports = router;
