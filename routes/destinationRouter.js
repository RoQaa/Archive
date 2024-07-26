const express = require("express");
const router = express.Router();
const authController = require(`../controllers/authController`);
const destinationController = require("../controllers/destinationController");

// router.use(authController.protect);

// router.use(authController.restrictTo("admin"));

router.post("/add", destinationController.createDestination);
router.get("", destinationController.getDestinations);

router
  .route("/:id")
  .get(destinationController.getOneDestination)
  .put(destinationController.updateDestination)
  .delete(destinationController.deleteDestination);

module.exports = router;
