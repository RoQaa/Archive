const mongoose = require("mongoose");

const aboutSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },

  aboutSerialNumber: {
    type: String,
    required: true,
    trim: true,
  },

  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
    required: true,
  },
});

const About = mongoose.model("About", aboutSchema);

module.exports = About;
