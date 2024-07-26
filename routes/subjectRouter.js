const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const subjectController = require("../controllers/subjectController");


router.use(authController.protect)
router.post("/add", subjectController.createSubject);
router.get("", subjectController.getSubjects);


//Admin Restricts
router.use(authController.restrictTo('admin'));
router
  .route("/:id")
  .get(subjectController.getOneSubject)
  .patch(subjectController.updateSubject)
  .delete(subjectController.deleteSubject);

module.exports = router;
