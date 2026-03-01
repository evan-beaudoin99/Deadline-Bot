const mongoose = require("mongoose")

const courseSchema = new mongoose.Schema({

    course_code: {
        type: String,
        required: true
    },
    course_name: {
        type: String,
        required: false
    },
    section: {
        type: String, 
        default: "A"
    },
    professor: String,
    professor_email: String,
    dates: {
        assignments: mongoose.Schema.Types.Mixed,
        tests: mongoose.Schema.Types.Mixed,
        tutorials: mongoose.Schema.Types.Mixed
    },
    summaryStatus: {
        type: String,
        enum: ["processing", "completed", "failed"],
        default: "processing"
    },
    summaryRequestedAt: Date,
    summaryCompletedAt: Date,
    summaryError: String,
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    pdfs: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Pdf"
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true })

courseSchema.index({ course_code: 1, section: 1, uploadedBy: 1 }, { unique: true })

module.exports = mongoose.model("Course", courseSchema)