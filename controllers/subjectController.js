const About = require("../models/aboutModel");
const Fax = require("../models/faxModel");
const Subject = require("../models/subjectModel");
const { catchAsync } = require("../utils/catchAsync");
const AppError = require("../utils/appError");

exports.createSubject = catchAsync(async (req, res, next) => {
  const newInventory = {
    ...req.body,
  };
  const doc = await Subject.create(newInventory);

  res.status(201).json({
    status: true,
    message: "Subject created successfully",
    doc,
  });
});

exports.getSubjects = catchAsync(async (req, res, next) => {
  const { name } = req.query;

  let filter = {};
  if (name) {
    filter.name = { $regex: name, $options: "i" };
  }
 // filter.destination = req.params.id;

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
  // Find all About documents related to the Subject
  const abouts = await About.find({ subject: req.params.id });

  // Delete all related Faxes documents
  await Promise.all(
    abouts.map(async (about) => {
      await Fax.deleteMany({ about: about._id });
    }),
  );

  // Delete all related About documents
  await About.deleteMany({ subject: req.params.id });

  // Delete the Subject document
  await Subject.findByIdAndDelete(req.params.id);

  res.status(200).json({
    status: true,
    message: "Deleted successfully",
  });
});
