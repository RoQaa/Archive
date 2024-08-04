const express = require("express");
const router = express.Router();
const authController = require(`../controllers/authController`);
const faxController = require("../controllers/faxController");

router.use(authController.protect);

// user
router.get("/my-faxes", faxController.getMyFaxes);
router.get('/getOneUserFax/:id', faxController.getOneUserFax)
router.get("/searchesByUser", faxController.searchesByUser)
router.post("/add", faxController.createFax);




//Admin
router.use(authController.restrictTo("admin"));
router.get("", faxController.getAllFaxes);


router.get("/searchesByAdmin", faxController.searchesByAdmin)

router
  .route("/:id")
  .patch(faxController.updateFax)
  .get(faxController.getOneFax)
  .delete(faxController.deleteFax);

module.exports = router;
