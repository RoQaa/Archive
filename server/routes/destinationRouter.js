const express = require("express");
const router = express.Router();
const authController = require(`../controllers/authController`);
const destinationController = require("../controllers/destinationController");

router.use(authController.protect)

router.post("/add", destinationController.createDestination);
router.get("", destinationController.getDestinations);

//Admin Restricts
router.use(authController.restrictTo('admin'));
router
  .route("/:id")
  .get(destinationController.getOneDestination)
  .patch(destinationController.updateDestination)
  .delete(destinationController.deleteDestination);

module.exports = router;
