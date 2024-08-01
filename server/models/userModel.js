const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Please Enter your UserName"],
    unique: [true, "there's a user with that name "],
    minlength: [2, " Password At least has 8 characters"],
  },

  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },

  password: {
    type: String,
    required: [true, "Please Enter your Password"],
    trim: true,
    minlength: [8, " Password At least has 8 characters"],
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please Enter your Confirm Password'],
    validate: {
      // This only works on CREATE and SAVE!!!
      validator: function (el) {
        return el === this.password;
      },
      message: 'Passwords are not the same',
    },
  },

  isActive: {
    type: Boolean,
    default: true,
  },
  passwordChangedAt: Date,

});

userSchema.index({ username: "text" });

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;

  next();
});

userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.pre(/^find/, function (next) {
  this.find({ isActive: { $ne: false } }).select("-__v");
  next();
});

//instance method check password login
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword,
) {
  return await bcrypt.compare(candidatePassword, userPassword); // compare bt3mal hash le candidate we btcompare b3deha
};

userSchema.methods.changesPasswordAfter = function (JWTTimestamps) {
  if (this.passwordChangedAt) {
    const changedTimestamps = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10,
    );
    return JWTTimestamps < changedTimestamps;
  }
  return false;
};

const User = mongoose.model("User", userSchema);
module.exports = User;
