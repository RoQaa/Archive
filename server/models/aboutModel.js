const mongoose = require("mongoose");

const aboutSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
   // unique: true,
   trim:true
 
  },


  user:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true},

  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
    required: true,
  },
});


//aboutSchema.index({ name: "text" });
aboutSchema.index({ name: 1, subject: 1,user:1 }, { unique: true });

aboutSchema.pre(/^find/, function (next) {
  this.populate({ path: "subject" }).select('-__v')
  next()
})

const About = mongoose.model("About", aboutSchema);

module.exports = About;
