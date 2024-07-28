const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const User = require(`./../models/userModel`);
const { catchAsync } = require(`./../utils/catchAsync`);
const AppError = require(`./../utils/appError`);

const signToken = (id) => {
  const token = jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
  return token;
};

const createSendToken = (user, statusCode, message, res) => {
  const token = signToken(user.id);

  const cookieOption = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true, // be in http only
  };

  if (process.env.NODE_ENV === "production") cookieOption.secure = true;

  res.cookie("jwt", token, cookieOption);

  user.password = undefined;

  res.status(statusCode).json({
    status: true,
    message,

    data: {
      username: user.username,

      role: user.role,
    },
    token,
  });
};

exports.login = catchAsync(async (req, res, next) => {
  const { username, password } = req.body;

  //1) check username && password exist,
  if (!username || !password) {
    return next(new AppError("من فضلك قم بادخال الاسم و كلمة المرور", 400));
  }

  const user = await User.findOne({ username: username }).select("+password"); // hyzaod el password el m5fee aslan

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("اسم المستخدم او كلمةالمرور غير صحيحة", 400));
  }

  createSendToken(user, 200, "تم تسجيل الدخول بنجاح", res);
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // protect handler -admin restreict
  const id = req.params.id;
  const user = await User.findById(id);
  if (!user) {
    return next(new AppError("هذا المستخدم غير موجود او قم بتسجيل الدخول مرة اخرى", 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;


  await user.save({ validateBeforeSave: false });


  res.status(200).json({
    status: true,
    message: "تم تغيير كلمة المرور",
  });
});



exports.logOut = catchAsync(async (req, res, next) => {
  res.cookie("jwt", "logged out", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    status: true,
    message: "You logged out",
    token: "",
  });
});

//MIDDLEWARE CHECK IF USER STILL LOGGED IN
exports.protect = catchAsync(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(new AppError("عليك تسجيل الدخول اولا", 401));
  }

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new AppError(`Your Session expires please Login again`, 401));
  }

  if (currentUser.changesPasswordAfter(decoded.iat)) {
    return next(
      new AppError(
        "قم بتسجيل الدخول مع كلمة المرورالجديدة",
        401,
      ),
    );
  }

  req.user = currentUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("ليس لديك الصلاحية للقيام بهذة العملية", 401),
      );
    }
    next();
  };
};
