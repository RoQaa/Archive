const generateRandomCode = require("../utils/generateRandomCode");
const About = require("../models/aboutModel");
const { catchAsync } = require("../utils/catchAsync");
const AppError = require("../utils/appError");

exports.createAbout = catchAsync(async (req, res, next) => {
  const aboutSerialNumber = generateRandomCode(8);

  const newInventory = {
    ...req.body,
    aboutSerialNumber,
  };
  const doc = await About.create(newInventory);

  res.status(201).json({
    status: true,
    message: "About created successfully",
    doc,
  });
});

exports.getAbouts = catchAsync(async (req, res, next) => {
  const { name, aboutSerialNumber } = req.query;

  let filter = {};
  if (name) {
    filter.name = { $regex: name, $options: "i" };
  }

  if (aboutSerialNumber) {
    filter.aboutSerialNumber = aboutSerialNumber;
  }

  const data = await About.find(filter).select("-__v");
  if (!data || data.length === 0) return next(new AppError(`no data`, 404));

  res.status(200).json({
    status: true,
    length: data.length,
    data,
  });
});

exports.getOneAbout = catchAsync(async (req, res, next) => {
  const doc = await About.findById(req.params.id);

  if (!doc) return next(new AppError("cannot found that About", 404));
  res.status(200).json({
    status: true,
    doc,
  });
});

exports.updateAbout = catchAsync(async (req, res, next) => {
  if (req.body.aboutSerialNumber) {
    return next(new AppError("Cant Update serial number", 400));
  }
  const doc = await About.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!doc) return next(new AppError("cannot found that About", 404));
  res.status(200).json({
    status: true,
    message: "updated Successfully",
    doc,
  });
});

exports.deleteAbout = catchAsync(async (req, res, next) => {
  await About.findByIdAndDelete(req.params.id);

  res.status(200).json({
    status: true,
    message: "deleted Successfully",
  });
});
