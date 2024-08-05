const mongoose = require("mongoose");

const destinationSchema = new mongoose.Schema({
  name: {
    type: String,
    trim:true,
    required: true,
    unique: true,
    
  },


});
destinationSchema.index({ name: "text" });


destinationSchema.pre(/^find/, function (next) {
  this.select('-__v')
  next();
})
const Destination = mongoose.model("Destination", destinationSchema);

module.exports = Destination;
