const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const aboutController = require("../controllers/about.controller");

// router.use(authController.protect);

// router.use(authController.restrictTo("admin"));

router.post("/add", aboutController.createAbout);
router.get("", aboutController.getAbouts);

router
  .route("/:id")
  .get(aboutController.getOneAbout)
  .put(aboutController.updateAbout)
  .delete(aboutController.deleteAbout);

module.exports = router;
