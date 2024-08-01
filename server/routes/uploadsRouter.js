const express = require("express");
const uploadController = require("../utils/upload");
const authController = require("../controllers/authController");

const router = express.Router();

router.use(authController.protect);

router.post(
  "/uploadSingle",
  uploadController.uploadSingle,
  uploadController.handleFileUpload,
  (req, res) => {
    res.status(200).json({
      status: "success",
      data: {
        file: {
          filename: req.file.filename,
          path: req.file.path,
          mimetype: req.file.mimetype,
          size: req.file.size,
        },
      },
    });
  },
);

router.post(
  "/uploadMultiple",
  uploadController.uploadMultiple("files", 10),
  uploadController.handleMultipleFileUpload,
  (req, res) => {
    res.status(200).json({
      status: "success",
      data: {
        files: req.filesProcessed,
      },
    });
  },
);

module.exports = router;
