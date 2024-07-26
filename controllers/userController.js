const mongoose= require('mongoose');
const multer=require('multer')
const sharp=require('sharp');

const Review = require('../models/reviewModel');
const { catchAsync } = require(`${__dirname}/../utils/catchAsync`);
const AppError = require(`${__dirname}/../utils/appError`);
const User=require(`${__dirname}/../models/userModel`);


const filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach(el => {
      if (allowedFields.includes(el)) newObj[el] = obj[el];
    });
    return newObj;
  };

 /*const multerStorage = multer.diskStorage({
   destination: (req, file, cb) => {
     cb(null, 'public/img/users');
   },
   filename: (req, file, cb) => {
     const ext = file.mimetype.split('/')[1];
     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
   }
 });


*/

 const multerFilter = (req, file, cb) => {
    
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

const multerStorage = multer.memoryStorage();



const upload = multer({
  storage: multerStorage,
 // limits: { fileSize: 2000000 /* bytes */ },
  fileFilter: multerFilter
});

exports.uploadUserPhoto = upload.single('profileImage');

//resize midlleWare
exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
});

exports.updateUser=catchAsync(async(req,res,next)=>{
   
    //Filtered out unwanted fields names that are not allowed to be updated
    const filteredBody = filterObj(req.body, 'name');
    if (req.file) filteredBody.profileImage = `https://dalilalhafr.com/api/public/img/users/${req.file.filename}`;

      
   
      
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true
  });
          if(!updatedUser){
            return next(new AppError(`Accont n't found`,404))
          }
   res.status(200).json({
    status:true,
    message:"Account Updated Successfully",
  //  data:updatedUser
   })

})

exports.updateUserByAdmin=catchAsync(async(req,res,next)=>{
  const id =req.params.id;
  const filteredBody = filterObj(req.body, 'name','role','isActive');
  const user = await User.aggregate([
    { $match: { _id: mongoose.Types.ObjectId(id) } },
    {
      $set: {
        name: filteredBody.name,
        role: filteredBody.role,
        isActive: filteredBody.isActive
      }
      
    },
 
    {
      $merge: {
        into: "users", // The target collection to merge the documents into
        whenMatched: "replace" // Specifies how to handle matching documents
      }
    }
  ]);


  if(!user){
    return next(new AppError(`Accont n't found`,404))
  }
res.status(200).json({
status:true,
message:"Account Updated Successfully",

})

})


exports.getUsers=catchAsync(async(req,res,next)=>{
  let data
  if(req.params.id){
     data = await User.findById(req.params.id);
  }else{data = await User.aggregate([
    {
      $project: { // Project all fields
        _id: 1,
        isActive: 1,
        profileImage:1,
        name:1,
        email:1,
        role:1
        // Include other fields as needed
      }
    }
  ])}

   
  if(!data){
    return next(new AppError("Users not found",404))
  }
  res.status(200).json({
    status:true,
    length:data.length,
    data

  })
})
exports.deleteUser=catchAsync(async(req,res,next)=>{

  const user = await User.findById(req.params.id)
  if(!user){
    return next(new AppError(`Account n't found`,404))
  }
  await Review.deleteMany({user:req.params.id})
  await user.delete();

  res.status(200).json({
    status:true,
    message:"you Delete this Account"
  })
})


exports.deleteAccount=catchAsync(async(req,res,next)=>{
  await Review.deleteMany({user:req.user.id})
 await User.findByIdAndDelete(req.user.id)
 res.cookie('jwt','loggedout',{
  expires:new Date(Date.now()+10*1000),
  httpOnly:true
});

 res.status(200).json({
    status:true,
    message:"you Delete this Account",
    token:"deletedAccount"
  })
})




exports.search=catchAsync(async(req,res,next)=>{
  const searchTerm = req.query.term;
  //const results = await User.find({ $text: { $search: searchTerm } }).limit(10);
  const results = await User.find({
    $or: [
      { name: { $regex: searchTerm, $options: "i" } },
      { email: { $regex: searchTerm, $options: "i" } }
    ]
  }).limit(10);

  if(!results){
    return next(new AppError(`Data n't found`,404))
  }
  res.status(200).json({
    status:true,
    results
  })
})

exports.creataAccount=catchAsync(async(req,res,next)=>{
  const newUser = await User.create(req.body);

  if (!newUser) {
    return next(new AppError(`SomeThing Error cannot sign up`, 404));
  }
  res.status(201).json({
    status:true,
    message:"Account Create Successfully"
  })
})
exports.profilePage=catchAsync(async(req,res,next)=>{
  ///protect
  const data =req.user;
  if(!data){
    return next(new AppError(`Something is wrong please Try again`,404))
  }
  res.status(200).json({
    status:true,
    data
  })
})