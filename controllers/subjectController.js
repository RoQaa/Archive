const generateRandomCode = require("../utils/generateRandomCode");
const Subject = require("../models/subjectModel");
const { catchAsync } = require("../utils/catchAsync");
const AppError = require("../utils/appError");

exports.createSubject = catchAsync(async (req, res, next) => {
  const subjectSerialNumber = generateRandomCode(8);

  const newInventory = {
    ...req.body,
    subjectSerialNumber,
  };
  const doc = await Subject.create(newInventory);

  res.status(201).json({
    status: true,
    message: "Subject created successfully",
    doc,
  });
});

exports.getSubjects = catchAsync(async (req, res, next) => {
  const { name, subjectSerialNumber } = req.query;

  let filter = {};
  if (name) {
    filter.name = { $regex: name, $options: "i" };
  }

  if (subjectSerialNumber) {
    filter.subjectSerialNumber = subjectSerialNumber;
  }

  const data = await Subject.find(filter).select("-__v");
  if (!data || data.length === 0) return next(new AppError(`no data`, 404));

  res.status(200).json({
    status: true,
    length: data.length,
    data,
  });
});

exports.getOneSubject = catchAsync(async (req, res, next) => {
  const doc = await Subject.findById(req.params.id);

  if (!doc) return next(new AppError("cannot found that Subject", 404));
  res.status(200).json({
    status: true,
    doc,
  });
});

exports.updateSubject = catchAsync(async (req, res, next) => {
  if (req.body.subjectSerialNumber) {
    return next(new AppError("Cant Update serial number", 400));
  }
  const doc = await Subject.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!doc) return next(new AppError("cannot found that Subject", 404));
  res.status(200).json({
    status: true,
    message: "updated Successfully",
    doc,
  });
});

exports.deleteSubject = catchAsync(async (req, res, next) => {
  await Subject.findByIdAndDelete(req.params.id);

  res.status(200).json({
    status: true,
    message: "deleted Successfully",
  });
});
