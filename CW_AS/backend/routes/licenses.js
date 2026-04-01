const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const LicenseController = require("../controllers/licenseController");

router.get("/", authMiddleware, LicenseController.getLicenses);
router.post("/license-update", authMiddleware, LicenseController.updateLicense);
router.delete("/delete-license/:id", authMiddleware, LicenseController.deleteLicense);

module.exports = router;
