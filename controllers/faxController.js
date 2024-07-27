const Fax = require("../models/faxModel");
const { catchAsync } = require("../utils/catchAsync");
const AppError = require("../utils/appError");

// user and admin
exports.createFax = catchAsync(async (req, res, next) => {
  req.body.user = req.user.id;
  const doc = await Fax.create(req.body);
  res.status(201).json({
    status: true,
    message: "تم انشاء الفاكس بنجاح",
    doc,
  });
});

//Admin
exports.getAllFaxes = catchAsync(async (req, res, next) => {
  let filter = {};
  const { faxType } = req.query;
  if (faxType) filter.faxType = faxType;
  const data = await Fax.find(filter);
  if (!data) return next(new AppError(`No data found`, 404));
  res.status(200).json({
    status: true,
    data,
  });
});

exports.searchByDatesAdmin = catchAsync(async (req, res, next) => {
  const { startDate, endDate } = req.body;
exports.getAllFaxes=catchAsync(async(req,res,next)=>{
    let filter={};
    const {faxType} =req.query;
    if(faxType) filter.faxType=faxType
    const data = await Fax.find(filter);
    if(!data) return next(new AppError(`No data found`,404))
        res.status(200).json({
            status:true,
            data
    })

})
exports.getOneFax=catchAsync(async(req,res,next)=>{
    const fax = await Fax.findById(req.params.id);
    if(!fax) return next(new AppError(`fax not found `,404))
        res.status(200).json({
            status:true,
            fax
    })
})
exports.searchByDatesAdmin=catchAsync(async(req,res,next)=>{
    const {startDate, endDate} = req.body;

  const data = await Fax.find({
    date: {
      $gte: startDate,
      $lte: endDate,
    },
  });
  if (!data || data.length === 0)
    return next(new AppError(`No data found`, 404));
  res.status(200).json({
    status: true,
    length: data.length,
    data,
  });
});

exports.updateFax = catchAsync(async (req, res, next) => {
  const doc = await Fax.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!doc) return next(new AppError("cannot found that fax", 404));
  res.status(200).json({
    status: true,
    message: "updated Successfully",
    doc,
  });
});

exports.deleteFax = catchAsync(async (req, res, next) => {
  await Fax.findByIdAndDelete(req.params.id);

  res.status(200).json({
    status: true,
    message: "deleted Successfully",
  });
});

//user
exports.getMyFaxes = catchAsync(async (req, res, next) => {
  const data = await Fax.find({ user: req.user.id });
  if (!data) return next(new AppError("No Data Found", 404));
  res.status(200).json({
    status: true,
    data,
  });
});

exports.searchByDatesUser = catchAsync(async (req, res, next) => {
  const { startDate, endDate } = req.body;

  const data = await Fax.find({
    user: req.user.id,
    date: {
      $gte: startDate,
      $lte: endDate,
    },
  });
  if (!data || data.length === 0)
    return next(new AppError(`No data found`, 404));
  res.status(200).json({
    status: true,
    data,
  });
});
    const data = await Fax.find({
        user:req.user.id,
        date: {
            $gte: startDate,
            $lte: endDate
        }
    });
    if (!data||data.length===0) return next(new AppError(`No data found`, 404))
    res.status(200).json({
        status: true,
        data

    })
})

