const generateRandomCode = require("../utils/generateRandomCode");
const Destination = require("../models/destinationNameModel");
const { catchAsync } = require("../utils/catchAsync");
const AppError = require("../utils/appError");

exports.createDestination = catchAsync(async (req, res, next) => {


  const newInventory = {
    ...req.body,
    
  };
  const doc = await Destination.create(newInventory);

  res.status(201).json({
    status: true,
    message: "Destination created successfully",
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
  if (!data || data.length === 0) return next(new AppError(`no data`, 404));

  res.status(200).json({
    status: true,
    length: data.length,
    data,
  });
});

exports.getOneDestination = catchAsync(async (req, res, next) => {
  const doc = await Destination.findById(req.params.id);

  if (!doc) return next(new AppError("cannot found that Destination", 404));
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
  if (!doc) return next(new AppError("cannot found that Destination", 404));
  res.status(200).json({
    status: true,
    message: "updated Successfully",
    doc,
  });
});

exports.deleteDestination = catchAsync(async (req, res, next) => {
  await Destination.findByIdAndDelete(req.params.id);

  res.status(200).json({
    status: true,
    message: "deleted Successfully",
  });
});
