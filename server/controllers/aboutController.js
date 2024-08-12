const Fax = require('../models/faxModel')
const About = require("../models/aboutModel");
const { catchAsync } = require("../utils/catchAsync");
const AppError = require("../utils/appError");

exports.createAbout = catchAsync(async (req, res, next) => {


  const newInventory = {
    ...req.body,

  };
  newInventory.user=req.user.id;
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
  filter.user=req.user.id

  const data = await About.find(filter)
  if (!data || data.length === 0) return next(new AppError(`لا نوجد بيانات لعرضها`, 404));

  res.status(200).json({
    status: true,
    length: data.length,
    data,
  });
});

exports.getOneAbout = catchAsync(async (req, res, next) => {
  const doc = await About.findOne({_id:req.params.id,user:req.user.id});

  if (!doc) return next(new AppError("هذا العنصر غير موجود", 404));
  res.status(200).json({
    status: true,
    doc,
  });
});

exports.updateAbout = catchAsync(async (req, res, next) => {
  // Find the About document by ID
  let doc = await About.findById(req.params.id);
  if(doc.name ==='لايوجد') return next(new AppError(`لا يمكن التعديل`,400))
  // If the document doesn't exist, return a 404 error
  if (!doc) return next(new AppError("هذا العنصر غير موجود", 404));

  // Update the document with the request body data
  doc = await About.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  // Send the updated document in the response
  res.status(200).json({
    status: true,
    message: "تم التعديل بنجاح",
    doc,
  });
});

exports.deleteAbout = catchAsync(async (req, res, next) => {
  // Find the About document by ID
  const doc = await About.findById(req.params.id);

  if(doc.name ==='لا يوجد') return next(new AppError(`لا يمكن الحذف`,400))
  // If the document doesn't exist, return a 404 error
  if (!doc) return next(new AppError("هذا العنصر غير موجود", 404));

  // Delete all related Faxes documents
  await Fax.deleteMany({ about: req.params.id });

  // Delete the About document
  await About.findByIdAndDelete(req.params.id);

  // Send a success response
  res.status(200).json({
    status: true,
    message: "تم الحذف الشأن وجميع الفاكسات المتعلقة بهذا الشأن",
  });
});
