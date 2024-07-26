const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const subjectController = require("../controllers/subjectController");

// router.use(authController.protect);

// router.use(authController.restrictTo("admin"));

router.post("/add", subjectController.createSubject);
router.get("", subjectController.getSubjects);

router
  .route("/:id")
  .get(subjectController.getOneSubject)
  .put(subjectController.updateSubject)
  .delete(subjectController.deleteSubject);

module.exports = router;
