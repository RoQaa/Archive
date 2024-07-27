const express = require("express");
const router = express.Router();
const authController = require(`../controllers/authController`);
const faxController = require("../controllers/faxController");

router.use(authController.protect);

// user
router.get("/my-faxes", faxController.getMyFaxes);

// user - admin
router.post("/add", faxController.createFax);
router.get("/searchDateByUser",faxController.searchByDatesUser)
//Admin
router.use(authController.restrictTo("admin"));
router.get("", faxController.getAllFaxes);
router.get("/searchDateByAdmin",faxController.searchByDatesAdmin)
router
  .route("/:id")
  .patch(faxController.updateFax)
  .get(faxController.getOneFax)
  .delete(faxController.deleteFax);

module.exports = router;
