const mongoose = require("mongoose")

const pdfSchema = new mongoose.Schema({
    filename: {
        type: String,
        required: true
    },
    data: {
        type: Buffer,
        required: true 
    }, 
    contentType: {
        type: String,
        required: true
    },
    hash: {
        type: String,
        unique: true
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    
   
})

module.exports = mongoose.model("Pdf", pdfSchema)