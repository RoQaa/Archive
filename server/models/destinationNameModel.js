const mongoose = require("mongoose");

const destinationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },


});

destinationSchema.pre(/^find/, function (next) {
  this.select('-__v')
  next();
})
const Destination = mongoose.model("Destination", destinationSchema);

module.exports = Destination;
