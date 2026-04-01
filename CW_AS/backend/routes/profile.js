const express = require("express");
const router = express.Router();
const multer = require("multer");
const authMiddleware = require("../middleware/authMiddleware");
const ProfileController = require("../controllers/profileController");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.get("/profile", authMiddleware, ProfileController.getProfile);
router.post("/profile", authMiddleware, upload.single("apd_profile_image"), ProfileController.updateProfile);

module.exports = router;