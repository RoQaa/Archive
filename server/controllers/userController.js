const User = require(`./../models/userModel`);

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

  if (!user) return next(new AppError(`هذا الحساب غير موجود`, 404));

  res.status(200).json({
    status: true,
    message: "تم تعديل الحساب",
    // user

  })

})


exports.getUsersByAdmin = catchAsync(async (req, res, next) => {
  const { username } = req.query;

  let filter = {};
  filter.role = 'user'
  if (username) {
    filter.username = { $regex: username, $options: "i" };

  }

 // const data = await User.find({ isActive: { $ne: false }});
 const data = await User.find();
  if (!data || data.length === 0) return next(new AppError(`لا يوجد مستخدمين لعرضهم`, 404))
  res.status(200).json({
    status: true,
    length: data.length,
    data
  })
})



exports.deleteUserByAdmin = catchAsync(async (req, res, next) => {

  const state = await User.findById(req.params.id)
  if(state.role==='admin') return next(new AppError(`لا يمكن التعديل حالة المسئول`,400))
 const user = await User.findByIdAndUpdate(req.params.id,{isActive:req.body.active},{new:true,runValidators:false})
  if (!user) {
    return next(new AppError(`هذا المستخدم غير موجود`, 404))
  }
  /*
  await Fax.deleteMany({ user: user.id })

  await user.delete();
*/
  res.status(200).json({
    status: true,
    message: "تم تعديل الحالة"
  })
})




exports.creataAccount = catchAsync(async (req, res, next) => {
  //restirct to admin
  console.log(req.body)
  const newUser = await User.create(req.body);

  if (!newUser) {
    return next(new AppError(`حدث خطأ ما`, 404));
  }
  res.status(201).json({
    status: true,
    message: "تم انشاء حساب"
  })
})


exports.getMyProfile = catchAsync(async (req, res, next) => {

  res.status(200).json({
    status: true,
    data: req.user
  })
})

exports.getOneUser = catchAsync(async (req, res, next) => {
  const doc = await User.findById(req.params.id);
  if (!doc) return next(new AppError(`هذا المستخدم غير موجود`, 404))
  res.status(200).json({
    status: true,
    doc
  })
})