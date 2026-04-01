const express = require("express");
const router = express.Router();
const AuthController = require("../controllers/authController");

// --- REGISTER ROUTE ---
router.post("/register", AuthController.register);

// --- LOGIN ROUTE ---
router.post("/login", AuthController.login);

// --- FORGET PASSWORD ROUTE ---
router.post("/forget-password", AuthController.forgetPassword);

module.exports = router;