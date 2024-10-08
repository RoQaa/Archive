const About = require("../models/aboutModel");
const Fax = require("../models/faxModel");
const Subject = require("../models/subjectModel");
const { catchAsync } = require("../utils/catchAsync");
const AppError = require("../utils/appError");

exports.createSubject = catchAsync(async (req, res, next) => {
  const newInventory = {
    ...req.body,
  };
  newInventory.user=req.user.id
  const doc = await Subject.create(newInventory);
    await About.create({name:"لا يوجد",subject:doc._id,user:req.user.id})
  res.status(201).json({
    status: true,
    message: "تم انشاء الموضوع",
    doc,
  });
});

exports.getSubjects = catchAsync(async (req, res, next) => {
  const { name } = req.query;

  let filter = {};
  if (name) {
    filter.name = { $regex: name, $options: "i" };
  }
  filter.destination = req.params.id;
  filter.user=req.user.id
  const data = await Subject.find(filter).select("-__v");
  if (!data || data.length === 0) return next(new AppError(`لا توجد بيانات`, 404));

  res.status(200).json({
    status: true,
    length: data.length,
    data,
  });
});

exports.getOneSubject = catchAsync(async (req, res, next) => {
  const doc = await Subject.findOne({_id:req.params.id,user:req.user.id});

  if (!doc) return next(new AppError("هذا الموضوع غير موجود", 404));
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
  if (!doc) return next(new AppError("هذا الموضوع غير موجود", 404));
  res.status(200).json({
    status: true,
    message: "تم التعديل بنجاح",
    //  doc,
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
    message: "تم حذف الموضوع مع الشؤون والفاكسات المتعلقة به",
  });
});
