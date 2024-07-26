const multer = require("multer");
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");
const AppError = require("../../Arshief/utils/appError");
const { catchAsync } = require("../../Arshief/utils/catchAsync");

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Not an image! Please upload only images.", 400), false);
  }
};

const multerStorage = multer.memoryStorage();

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

const resizeImage = (folder, width, height) => {
  return catchAsync(async (req, res, next) => {
    if (!req.file) return next();

    const filename = `${req.file.originalname}-${Date.now()}.jpeg`;
    const dir = path.join(__dirname, "..", "public", "img", folder);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    await sharp(req.file.buffer)
      .resize(width, height)
      .toFormat("jpeg")
      .jpeg({ quality: 90 })
      .toFile(path.join(dir, filename));

    req.file.filename = filename;
    req.file.path = path.join("public", "img", folder, filename);

    next();
  });
};

module.exports = {
  uploadSingle: (fieldName) => upload.single(fieldName),
  uploadMultiple: (fieldName, maxCount) => upload.array(fieldName, maxCount),
  resizeImage,
};
