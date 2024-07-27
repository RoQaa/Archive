const User = require(`./../models/userModel`);
const Fax =require('../models/faxModel')
const { catchAsync } = require(`./../utils/catchAsync`);
const AppError = require(`./../utils/appError`);



const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.updateUserByAdmin = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  const filteredBody = filterObj(req.body, 'username', 'role', 'isActive');
  const user = await User.findByIdAndUpdate(id, filteredBody, { new: true, runValidators: true })

  if (!user) return next(new AppError(`Accont n't found`, 404));

  res.status(200).json({
    status: true,
    message: "Account Updated Successfully",
    user

  })

})


exports.getUsersByAdmin = catchAsync(async (req, res, next) => {
  const { username } = req.query;

  let filter = {};
  filter.role='user'
  if (username) {
    filter.username = { $regex: username, $options: "i" };
    
  }

  const data = await User.find(filter);
  if (!data || data.length === 0) return next(new AppError(`No users Found`, 404))
  res.status(200).json({
    status: true,
    length:data.length,
    data
  })
})



exports.deleteUserByAdmin = catchAsync(async (req, res, next) => {

  const user = await User.findById(req.params.id)
  if (!user) {
    return next(new AppError(`User n't found`, 404))
  }
  await Fax.deleteMany({user:user.id})
    
  await user.delete();

  res.status(200).json({
    status: true,
    message: "you Delete this User"
  })
})




exports.creataAccount = catchAsync(async (req, res, next) => {
  //restirct to admin
  console.log(req.body)
  const newUser = await User.create(req.body);

  if (!newUser) {
    return next(new AppError(`SomeThing Error cannot sign up`, 404));
  }
  res.status(201).json({
    status: true,
    message: "Account Create Successfully"
  })
})


exports.getMyProfile=catchAsync(async (req,res,next)=>{
  
  res.status(200).json({
    status:true,
    data:req.user
  })
})

exports.getOneUser=catchAsync(async(req,res,next)=>{
  const doc = await User.findById(req.params.id);
  if(!doc)  return next(new AppError(`هذا المستخدم غير موجود`,404))
    res.status(200).json({
      status:true,
      doc
  })
 })