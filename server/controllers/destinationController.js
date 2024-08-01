const Destination = require("../models/destinationNameModel");
const Subject = require("../models/subjectModel");
const About = require('../models/aboutModel')
const Fax = require('../models/faxModel')
const { catchAsync } = require("../utils/catchAsync");
const AppError = require("../utils/appError");

exports.createDestination = catchAsync(async (req, res, next) => {


  const newInventory = {
    ...req.body,

  };
  const doc = await Destination.create(newInventory);

  res.status(201).json({
    status: true,
    message: "تم انشاء اسم جهة جديد",
    doc,
  });
});

exports.getDestinations = catchAsync(async (req, res, next) => {
  const { name } = req.query;

  let filter = {};
  if (name) {
    filter.name = { $regex: name, $options: "i" };
  }


  const data = await Destination.find(filter).select("-__v");
  if (!data || data.length === 0) return next(new AppError(`لا توجد بيانات`, 404));

  res.status(200).json({
    status: true,
    length: data.length,
    data,
  });
});

exports.getOneDestination = catchAsync(async (req, res, next) => {
  const doc = await Destination.findById(req.params.id).select('-__v');

  if (!doc) return next(new AppError("اسم الجهة غير موجود", 404));
  res.status(200).json({
    status: true,
    doc,
  });
});

exports.updateDestination = catchAsync(async (req, res, next) => {


  const doc = await Destination.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!doc) return next(new AppError("اسم الجهة غير موجود", 404));
  res.status(200).json({
    status: true,
    message: "تم التعديل بنجاح",
    //  doc,
  });
});

exports.deleteDestination = catchAsync(async (req, res, next) => {

  const subjects = await Subject.find({ destination: req.params.id });

  // Find all related About documents
  const abouts = await Promise.all(
    subjects.map(async (sub) => {
      return About.find({ subject: sub._id });
    })
  );

  // Flatten the abouts array
  const allAbouts = [].concat(...abouts);

  // Delete all related Faxes documents
  await Promise.all(
    allAbouts.map(async (about) => {
      await Fax.deleteMany({ about: about._id });
    })
  );

  // Delete all related About documents
  await Promise.all(
    subjects.map(async (sub) => {
      await About.deleteMany({ subject: sub._id });
    })
  );

  // Delete all related Subject documents
  await Subject.deleteMany({ destination: req.params.id });

  // Delete the Destination document
  await Destination.findByIdAndDelete(req.params.id);

  res.status(200).json({
    status: true,
    message: "تم حذف الجهة ومواضيعها وشئونها والفاكسات الخاصة بها",
  });


});
