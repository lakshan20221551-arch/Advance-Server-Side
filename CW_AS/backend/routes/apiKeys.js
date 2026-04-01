
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const ApiKeyController = require("../controllers/apiKeyController");

// Middleware to authenticate JWT for user
const authMiddleware = (req, res, next) => {
    const authHeader = req.header("Authorization");
    if (!authHeader) return res.status(401).json({ message: "Access Denied. No token provided." });

    const token = authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Invalid token format." });

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;
        next();
    } catch (err) {
        res.status(400).json({ message: "Invalid or expired token." });
    }
};

// Generate a new API Key for developer access
router.post("/generate", authMiddleware, ApiKeyController.generate);

// Get all API keys for the current user
router.get("/my-keys", authMiddleware, ApiKeyController.getMyKeys);

// Revoke an API key
router.delete("/revoke/:keyId", authMiddleware, ApiKeyController.revokeKey);

// Get usage statistics for keys
router.get("/stats", authMiddleware, ApiKeyController.getStats);

module.exports = router;
