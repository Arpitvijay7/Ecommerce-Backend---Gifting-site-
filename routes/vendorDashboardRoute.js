const app = require("../app");
const express = require("express");

const { vendorDashboard } = require("../controllers/vendorDashboardController");
const { isAuthenticatedUser, authorizedRoles } = require("../middleware/auth");
const router = express.Router();

router
  .route("/vendor/dashboard")
  .post(isAuthenticatedUser, authorizedRoles("admin"), (req, res) =>
    vendorDashboard(res, req, next)
  );

module.exports = router;
