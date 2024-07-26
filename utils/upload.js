const multer = require("multer");
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");
const AppError = require("../../Arshief/utils/appError");
const { catchAsync } = require("../../Arshief/utils/catchAsync");

const multerFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  if (allowedTypes.some((type) => file.mimetype.startsWith(type))) {
    cb(null, true);
  } else {
    cb(
      new AppError(
        "Not a valid file type! Please upload only images, PDFs, or Word documents.",
        400,
      ),
      false,
    );
  }
};

const multerStorage = multer.memoryStorage();

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

const ensureUserDirExists = (userId) => {
  const userDir = path.join(__dirname, "..", "public", "uploads", userId);
  if (!fs.existsSync(userDir)) {
    fs.mkdirSync(userDir, { recursive: true });
  }
  return userDir;
};

const uploadFile = upload.single("file");

const handleFileUpload = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  const userId = req.user.id;
  const userDir = ensureUserDirExists(userId);
  const timestamp = Date.now();
  let filename;

  if (req.file.mimetype.startsWith("image")) {
    filename = `user-${userId}-${timestamp}.jpeg`;
    await sharp(req.file.buffer)
      .resize(150, 150)
      .toFormat("jpeg")
      .jpeg({ quality: 90 })
      .toFile(path.join(userDir, filename));

    //
  } else if (req.file.mimetype === "application/pdf") {
    filename = `user-${userId}-${timestamp}.pdf`;
    fs.writeFileSync(path.join(userDir, filename), req.file.buffer);

    //
  } else if (
    req.file.mimetype === "application/msword" ||
    req.file.mimetype ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    filename = `user-${userId}-${timestamp}.docx`;
    fs.writeFileSync(path.join(userDir, filename), req.file.buffer);

    //
  } else {
    return next(new AppError("Unsupported file type!", 400));

    //
  }

  req.file.filename = filename;
  req.file.path = path.join("public", "uploads", userId, filename);

  next();
});

const uploadMultipleFiles = (fieldName, maxCount) =>
  upload.array(fieldName, maxCount);

module.exports = {
  uploadSingle: uploadFile,
  uploadMultiple: uploadMultipleFiles,
  handleFileUpload,
};
