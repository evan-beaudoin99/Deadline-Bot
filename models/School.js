const mongoose = require("mongoose")

const schoolSchema = new mongoose.Schema({

    institution: {
        type: String, 
        required: true,
        unique: true,
        trim: true
    },
    
    semesters: {
        fall: { 
            schedule: [
                {
                    week: mongoose.Schema.Types.Mixed,
                    start: String,
                    end: String,
                    notes: String
                }
            ]
        },

        winter: {
            schedule: [
                {
                    week: mongoose.Schema.Types.Mixed,
                    start: String,
                    end: String,
                    notes: String
                }
            ]
        },
        
        summer: {
            schedule: [
                {
                    week: mongoose.Schema.Types.Mixed,
                    start: String,
                    end: String,
                    notes: String
                }
            ]
        }
    },
    
    users: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    onboarding: {
        status: {
            type: String,
            enum: ["pending", "approved", "rejected", "active"],
            default: "pending"
        },
        requestedAt: Date,
        contactEmail: String,
        notes: String
    },
    isScheduleActive: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true })

module.exports = mongoose.model("School", schoolSchema)