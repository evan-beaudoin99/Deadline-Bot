const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    username: { 
      type: String, 
      required: true,
      unique: true,
      trim: true
    },
    email: { 
      type: String, 
      required: true,
      unique: true,
      lowercase: true
    },
    password: { type: String, required: true },

    pdfs: [ 
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Pdf"
      }
    ],
    courses: [ 
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course"
      }
    ],
    }, {timestamps: true}
);

module.exports = mongoose.model("User", userSchema);
