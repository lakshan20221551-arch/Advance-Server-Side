const express = require("express");
const router = express.Router();
const AuthController = require("../controllers/authController");

router.post("/register", AuthController.register);

// Verification Route 
router.get("/verify/:token", AuthController.verifyEmail);

router.post("/login", AuthController.login);


router.post("/logout", AuthController.logout);

router.post("/forgot-password", AuthController.forgetPassword);


router.post("/reset-password", AuthController.resetPassword);

module.exports = router;