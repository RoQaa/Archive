const Fax = require('../models/faxModel')
const { catchAsync } = require("../utils/catchAsync");
const AppError = require("../utils/appError");

// user and admin
exports.createFax=catchAsync(async(req,res,next)=>{
    req.body.user=req.user.id
    const doc = await Fax.create(req.body);
    res.status(201).json({
        status:true,
        message:"تم انشاء الفاكس بنجاح",
        doc
    })
})




//Admin
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
exports.getMyFaxes=catchAsync(async(req,res,next)=>{
    const data = await Fax.find({user:req.user.id})
    if(!data) return next(new AppError('No Data Found',404))
        res.status(200).json({
            status:true,
            data
    })
})