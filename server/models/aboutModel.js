const mongoose = require("mongoose");

const aboutSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
   // unique: true,
   trim:true
 
  },



  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
    required: true,
  },
});

aboutSchema.pre(/^find/, function (next) {
  this.populate({ path: "subject" }).select('-__v')
  next()
})

const About = mongoose.model("About", aboutSchema);

module.exports = About;
