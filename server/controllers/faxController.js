const Fax = require("../models/faxModel");
const { catchAsync } = require("../utils/catchAsync");
const AppError = require("../utils/appError");

// user and admin
exports.createFax = catchAsync(async (req, res, next) => {
  req.body.user = req.user.id;
  await Fax.create(req.body);
  // const doc = await Fax.create(req.body);
  res.status(201).json({
    status: true,
    message: "تم انشاء الفاكس بنجاح",
    // doc,
  });
});

//Admin
exports.getAllFaxes = catchAsync(async (req, res, next) => {

  const { page, limit } = req.query;

  const pageUpdate = page * 1 || 1;
  const limitUpdate = limit * 1 || 100;
  const skip = (pageUpdate - 1) * limitUpdate;

  const data = await Fax.find().skip(skip).limit(limitUpdate);
  if (!data) return next(new AppError(`لا توجد بيانات`, 404));
  res.status(200).json({
    status: true,
    length: data.length,
    data,
  });
});


exports.getOneFax = catchAsync(async (req, res, next) => {
  const fax = await Fax.findById(req.params.id);
  if (!fax) return next(new AppError(`هذا الفاكس غير موجود `, 404))
  res.status(200).json({
    status: true,
    fax
  })
})

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
    length: data.length,
    data,
  });
});



exports.getOneUserFax = catchAsync(async (req, res, next) => {
  const fax = await Fax.find({ _id: req.params.id, user: req.user.id });
  if (!fax) return next(new AppError(`هذا الفاكس غير موجود `, 404))
  res.status(200).json({
    status: true,
    fax
  })
})





exports.searchesByAdmin = catchAsync(async (req, res, next) => {
  const { startDate, endDate, username, fax_Number, destinationName, faxType } = req.query;

  let matchConditions = {};

  // Collect search criteria
  if (username) {
    matchConditions['user.username'] = { $regex: username, $options: 'i' };
  }
  if (fax_Number) {
    // Convert fax_Number to number if it's numeric
    const faxNumber = isNaN(fax_Number) ? fax_Number : Number(fax_Number);
    matchConditions['faxNumber'] = faxNumber;
  }
  if (faxType) {
    matchConditions['faxType'] = faxType;
  }

  let pipeline = [
    {
      $lookup: {
        from: 'users',
        localField: 'user',
        foreignField: '_id',
        as: 'user'
      }
    },
    { $unwind: '$user' },
    {
      $lookup: {
        from: 'abouts',
        localField: 'about',
        foreignField: '_id',
        as: 'about'
      }
    },
    { $unwind: '$about' },
    {
      $lookup: {
        from: 'subjects',
        localField: 'about.subject',
        foreignField: '_id',
        as: 'about.subject'
      }
    },
    { $unwind: '$about.subject' },
    {
      $lookup: {
        from: 'destinations',
        localField: 'about.subject.destination',
        foreignField: '_id',
        as: 'about.subject.destination'
      }
    },
    { $unwind: '$about.subject.destination' }
  ];

  // Handle date range filtering
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setDate(end.getDate() + 1); // Add one day to endDate to include the entire end date

    pipeline.push({
      $match: {
        date: {
          $gte: start,
          $lt: end
        }
      }
    });
  }

  // Add other match conditions based on query parameters
  if (destinationName) {
    pipeline.push({
      $match: {
        ...matchConditions,
        'about.subject.destination.name': { $regex: destinationName, $options: 'i' }
      }
    });
  } else {
    pipeline.push({ $match: matchConditions });
  }

  // Execute the aggregation pipeline
  const data = await Fax.aggregate(pipeline);

  // Handle case when no data is found
  if (!data || data.length === 0) return next(new AppError(`لا توجد بيانات لعرضها`, 404));

  // Send response
  res.status(200).json({
    status: true,
    length: data.length,
    data
  });
});





exports.searchesByUser = catchAsync(async (req, res, next) => {

  const { startDate, endDate, fax_Number, destinationName, faxType } = req.query;

  let matchConditions = {};

  // Collect search criteria
  if (req.user.username) {
    matchConditions['user.username'] = req.user.username
  }
  if (fax_Number) {
    // Convert fax_Number to number if it's numeric
    const faxNumber = isNaN(fax_Number) ? fax_Number : Number(fax_Number);
    matchConditions['faxNumber'] = faxNumber;
  }
  if (faxType) {
    matchConditions['faxType'] = faxType;
  }

  let pipeline = [
    {
      $lookup: {
        from: 'users',
        localField: 'user',
        foreignField: '_id',
        as: 'user'
      }
    },
    { $unwind: '$user' },
    {
      $lookup: {
        from: 'abouts',
        localField: 'about',
        foreignField: '_id',
        as: 'about'
      }
    },
    { $unwind: '$about' },
    {
      $lookup: {
        from: 'subjects',
        localField: 'about.subject',
        foreignField: '_id',
        as: 'about.subject'
      }
    },
    { $unwind: '$about.subject' },
    {
      $lookup: {
        from: 'destinations',
        localField: 'about.subject.destination',
        foreignField: '_id',
        as: 'about.subject.destination'
      }
    },
    { $unwind: '$about.subject.destination' }
  ];

  // Handle date range filtering
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setDate(end.getDate() + 1); // Add one day to endDate to include the entire end date

    pipeline.push({
      $match: {
        date: {
          $gte: start,
          $lt: end
        }
      }
    });
  }

  // Add other match conditions based on query parameters
  if (destinationName) {
    pipeline.push({
      $match: {
        ...matchConditions,
        'about.subject.destination.name': { $regex: destinationName, $options: 'i' }
      }
    });
  } else {
    pipeline.push({ $match: matchConditions });
  }

  // Execute the aggregation pipeline
  const data = await Fax.aggregate(pipeline);

  // Handle case when no data is found
  if (!data || data.length === 0) return next(new AppError(`لا توجد بيانات لعرضها`, 404));

  // Send response
  res.status(200).json({
    status: true,
    length: data.length,
    data
  });
})
