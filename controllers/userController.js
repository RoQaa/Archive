const mongoose= require('mongoose');
const multer=require('multer')
const sharp=require('sharp');


const { catchAsync } = require(`./../utils/catchAsync`);
const AppError = require(`./../utils/appError`);
const User=require(`./../models/userModel`);


const filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach(el => {
      if (allowedFields.includes(el)) newObj[el] = obj[el];
    });
    return newObj;
  };

  const multerFilter = (req, file, cb) => {
    const allowedTypes = ['image/', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

    if (allowedTypes.some(type => file.mimetype.startsWith(type))) {
        cb(null, true);
    } else {
        cb(new AppError('Not a valid file type! Please upload only images, PDFs, or Word documents.', 400), false);
    }
};

const multerStorage = multer.memoryStorage();
const upload = multer({
    storage: multerStorage,
    // limits: { fileSize: 2000000 /* bytes */ },
    fileFilter: multerFilter
});

exports.uploadFile = upload.single('file');



//resize midlleWare
exports.resizeUserFile = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  // Define the filename based on the file type
  const timestamp = Date.now();
  let filename;
  if (req.file.mimetype.startsWith('image')) {
    filename = `user-Testtttttttttttt-${timestamp}.jpeg`;
    await sharp(req.file.buffer)
      .resize(500, 500)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(`public/img/users/${filename}`);
  } else if (req.file.mimetype === 'application/pdf') {
    filename = `user-Test-${timestamp}.pdf`;
    fs.writeFileSync(path.join(__dirname, `public/files/${filename}`), req.file.buffer);
  } else if (req.file.mimetype === 'application/msword' || req.file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    filename = `user-Test-${timestamp}.docx`;
    fs.writeFileSync(path.join(__dirname, `public/files/${filename}`), req.file.buffer);
  } else {
    return next(new AppError('Unsupported file type!', 400));
  }

  req.file.filename = filename;
  next();
});



exports.testPdfFiles=catchAsync(async(req,res,next)=>{
  console.log(req.file.filename)
  res.status(200).json({
    filePath:req.file.filename
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
        isActive: filteredBody.isActive,
      },
    },

    {
      $merge: {
        into: "users", // The target collection to merge the documents into
        whenMatched: "replace", // Specifies how to handle matching documents
      },
    },
  ]);

  if (!user) {
    return next(new AppError(`Accont n't found`, 404));
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
 
  await user.delete();

  res.status(200).json({
    status:true,
    message:"you Delete this Account"
  })
})


exports.deleteAccount=catchAsync(async(req,res,next)=>{

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




exports.search = catchAsync(async (req, res, next) => {
  const searchTerm = req.query.term;
  //const results = await User.find({ $text: { $search: searchTerm } }).limit(10);
  const results = await User.find({
    $or: [
      { name: { $regex: searchTerm, $options: "i" } },
      { email: { $regex: searchTerm, $options: "i" } },
    ],
  }).limit(10);

  if (!results) {
    return next(new AppError(`Data n't found`, 404));
  }
  res.status(200).json({
    status: true,
    results,
  });
});

exports.creataAccount = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body);

  if (!newUser) {
    return next(new AppError(`SomeThing Error cannot sign up`, 404));
  }
  res.status(201).json({
    status:true,
    message:"Account Create Successfully"
  })
})
/*
exports.profilePage=catchAsync(async(req,res,next)=>{
  ///protect
  const data = req.user;
  if (!data) {
    return next(new AppError(`Something is wrong please Try again`, 404));
  }
  res.status(200).json({
    status:true,
    data
  })
})
  */