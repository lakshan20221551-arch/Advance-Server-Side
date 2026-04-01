

const express = require("express");
const router = express.Router();
const ApiKeyModel = require("../models/apiKeyModel");
const PublicApiController = require("../controllers/publicApiController");

// Developer API key middleware
const apiKeyMiddleware = async (req, res, next) => {
    const authHeader = req.header("Authorization");
    if (!authHeader) return res.status(401).json({ message: "Access Denied. No API key provided." });

    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
        return res.status(401).json({ message: "Invalid API key format. Use: Bearer <key>" });
    }

    const apiKey = parts[1];
    
    try {
        const keyData = await ApiKeyModel.validateApiKey(apiKey);

        if (!keyData) {
            return res.status(401).json({ message: "Invalid API Key." });
        }

        if (keyData.IsRevoked) {
            return res.status(401).json({ message: "API Key has been revoked." });
        }

        // Key is valid. Log the usage.
        await ApiKeyModel.logKeyUsage(keyData.KeyID, req.originalUrl, req.ip || '');

        req.apiKeyData = keyData;
        next();
    } catch (err) {
        console.error("Auth Middleware Error:", err);
        res.status(500).json({ message: "Server error" });
    }
};

/**
 * @swagger
 * /api/public/featured-alumnus:
 *   get:
 *     summary: Retrieve the featured alumnus of the day
 *     description: Returns details of the featured alumnus profile. Requires a valid Bearer API Key.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved the featured alumnus.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 alumnus:
 *                   type: object
 *       401:
 *         description: Unauthorized. Invalid or missing API key.
 *       404:
 *         description: No featured alumnus found.
 */
router.get("/featured-alumnus", apiKeyMiddleware, PublicApiController.getFeaturedAlumnus);

module.exports = router;
