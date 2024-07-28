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
   // doc,
  });
});

//Admin
exports.getAllFaxes = catchAsync(async (req, res, next) => {
  let filter = {};
  const { faxType,page,limit } = req.query;
  if (faxType) filter.faxType = faxType;

      const pageUpdate = page * 1 || 1;
      const limitUpdate = limit * 1 || 100;
      const skip = (pageUpdate - 1) * limitUpdate;

  const data = await Fax.find(filter).skip(skip).limit(limitUpdate);
  if (!data) return next(new AppError(`لا توجد بيانات`, 404));
  res.status(200).json({
    status: true,
    length:data.length,
    data,
  });
});


exports.getOneFax=catchAsync(async(req,res,next)=>{
    const fax = await Fax.findById(req.params.id);
    if(!fax) return next(new AppError(`هذا الفاكس غير موجود `,404))
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
    return next(new AppError(`لا توجد بيانات`, 404));
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
  if (!doc) return next(new AppError("هذا الفاكس غير موجود", 404));
  res.status(200).json({
    status: true,
    message: "تم التعديل",
 //   doc,
  });
});

exports.deleteFax = catchAsync(async (req, res, next) => {
  await Fax.findByIdAndDelete(req.params.id);

  res.status(200).json({
    status: true,
    message: "تم الحذف",
  });
});

//user
exports.getMyFaxes = catchAsync(async (req, res, next) => {
  const data = await Fax.find({ user: req.user.id });
  if (!data) return next(new AppError("لا توجد فاكسات", 404));
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
    return next(new AppError(`لا توجد بيانات`, 404));
  res.status(200).json({
    status: true,
    data,
  });
});
   


