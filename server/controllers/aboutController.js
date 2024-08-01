const Fax = require('../models/faxModel')
const About = require("../models/aboutModel");
const { catchAsync } = require("../utils/catchAsync");
const AppError = require("../utils/appError");

exports.createAbout = catchAsync(async (req, res, next) => {


  const newInventory = {
    ...req.body,

  };
  const doc = await About.create(newInventory);

  res.status(201).json({
    status: true,
    message: "تم الانشاء",
    doc,
  });
});

exports.getAbouts = catchAsync(async (req, res, next) => {
  const { name } = req.query;

  let filter = {};
  if (name) {
    filter.name = { $regex: name, $options: "i" };
  }
  filter.subject = req.params.id;


  const data = await About.find(filter)
  if (!data || data.length === 0) return next(new AppError(`لا نوجد بيانات لعرضها`, 404));

  res.status(200).json({
    status: true,
    length: data.length,
    data,
  });
});

exports.getOneAbout = catchAsync(async (req, res, next) => {
  const doc = await About.findById(req.params.id);

  if (!doc) return next(new AppError("هذا العنصر غير موجود", 404));
  res.status(200).json({
    status: true,
    doc,
  });
});

exports.updateAbout = catchAsync(async (req, res, next) => {

  const doc = await About.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!doc) return next(new AppError("هذا العنصر غير موجود", 404));
  res.status(200).json({
    status: true,
    message: "تم التعديل بنجاح",
    //   doc,
  });
});

exports.deleteAbout = catchAsync(async (req, res, next) => {
  // Delete all related Faxes documents
  await Fax.deleteMany({ about: req.params.id });

  // Delete the About document
  await About.findByIdAndDelete(req.params.id);

  res.status(200).json({
    status: true,
    message: "تم الحذف الشأن وجميع الفاكسات المتعلقة بهذا الشأن",
  });
});
