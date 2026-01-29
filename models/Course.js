const mongoose = require("mongoose")

const courseSchema = new mongoose.Schema({

    course_code: String,
    course_name: String,
    professor: String,
    professor_email: String,
    dates: {
        assignments: mongoose.Schema.Types.Mixed,
        test: mongoose.Schema.Types.Mixed,
        tutorials: mongoose.Schema.Types.Mixed
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    pdf: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model("Course", courseSchema)