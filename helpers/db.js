const mongoose = require("mongoose");
const User = require("../models/User")
const Pdf = require("../models/Pdf")
const Course = require("../models/Course")

const crypto = require('crypto')

const bcrypt = require('bcrypt')

// Connect to the database
function startServer() {
     mongoose.connect("mongodb://localhost:27017/deadline")
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.error(err));
}

async function createUser(newUser) {
    try {

        const exists = await User.findOne({username: newUser.username, email: newUser.email})
        if (exists) {
            return {user: newUser, message: "User Already Exists", success: false}
        }

        const user = new User(newUser)
        await user.save();
        return {user: newUser, message: "User Created!", success: true }
    } catch (err) {
        console.error(err)
        return {err: err, message: "Failed to Upload PDF", success: false}
    }
}

async function authenticateUser(user) {

        try {
            const dbuser = await User.findOne({username: user.username})
            if (dbuser) {
                const match = await bcrypt.compare(user.password, dbuser.password)
                if (match) {
                    return {user: dbuser, message: "Found User", success: true}
                } else {
                    return {user: dbuser, message: "Invalid Password", success: false}
                }
            } 
            else {
                return {user: user, message: "User does not exist or Invalid Username", success: false}
            }
        } catch (err) {
        console.error(err)
        return null
    }
}

async function uploadPDF(userId, file) {
    try {

        const fileHash = generateHash(file.buffer)
        
        // 1. Check if the pdf already exists by comparing hashes
        const exists = await Pdf.findOne({hash: fileHash})
        if (exists) {
            return {message: "Pdf already exists", success: false}
        }

        // 2. Add to PDFs Collection
        const pdf = await Pdf.create({
            filename: file.originalname,
            data: file.buffer,
            contentType: file.mimetype,
            hash: fileHash,
            uploadedBy: userId
        })

        // 3. Add reference to user
        await User.findByIdAndUpdate(
            userId,
            { $addToSet: { pdfs: pdf._id} } // addToSet prevents duplicate ids
        )

        return {pdfId: pdf._id, message: "Succesfully Uploaded PDF", success: true}

    } catch (err) {
        console.error(err)
        return {err: err, message: "Failed to Upload PDF", success: false}
    }
}


async function removePdf(userId, pdfId) {
    try {
        // 1. Remove the actual PDF document
        const deletedPdf = await Pdf.findByIdAndDelete(pdfId);

        if (!deletedPdf) {
            return { message: "PDF does not exist", success: false };
        }

        // 2. Remove the reference from the User's array
        await User.updateOne(
            { _id: userId },
            { $pull: { pdfs: pdfId } } 
        );

        // 3. Remove the course outline from the collection
        const deletedCourse = await Course.deleteOne({pdf: pdfId})
        console.log("Here: ", deletedCourse)

        return { message: "PDF Successfully Deleted", success: true };

    } catch {
        console.error(err)
        return {err: err, message: "Failed to Remove PDF", success: false}
    }
}

async function getCourseData(userId) {

    try {
        const user = await User.findById(userId)
            .populate('courses')
            .lean()

        if (!user) {
            return {data: null, message: "Could not find user under that username", success: false }
        }
        if (user.courses.length === 0) {
            return {data: null, message: "User has no Course Data", success: false }
        }

        return {courses: user.courses, message: "All Course Data Here", success: true }

    } catch (err) {
        console.error(err)
        return null
    }
}

async function getPDFs(id) {
      try {
        const userObj = await User.findById(id)
            .populate('pdfs', 'filename')
        if (!userObj) {
            return {data: null, message: "Could not find user under that username", success: false }
        }
        const sessionObj = userObj.pdfs

        // console.log("Here: ", sessionObj)

        return sessionObj

    } catch (err) {
        console.error(err)
        return null
    } 
}

function generateHash(input) {
  return crypto.createHash('md5').update(input).digest('hex')
}

module.exports = {
    startServer,
    createUser,
    authenticateUser,
    uploadPDF,
    getCourseData,
    getPDFs,
    removePdf
}