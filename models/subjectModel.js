const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },

 

  destination: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Destination",
  //  required: true,
  },
});

subjectSchema.pre(/^find/,function(next){
  this.populate({path:"destination"}).select('-__v')
  next()
})

const Subject = mongoose.model("Subject", subjectSchema);

module.exports = Subject;
