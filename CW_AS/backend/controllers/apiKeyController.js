
const crypto = require("crypto");
const ApiKeyModel = require("../models/apiKeyModel");

class ApiKeyController {
    static async generate(req, res) {
        try {
            const { clientName } = req.body;
            if (!clientName) return res.status(400).json({ message: "Client name is required." });

            const apiKey = crypto.randomBytes(32).toString('hex');
            
            await ApiKeyModel.createApiKey(req.user.id, clientName, apiKey);

            res.status(201).json({ message: "API Key generated successfully", apiKey });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Server error" });
        }
    }

    static async getMyKeys(req, res) {
        try {
            const keys = await ApiKeyModel.getKeysByUser(req.user.id);
            res.json(keys);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Server error" });
        }
    }

    static async revokeKey(req, res) {
        try {
            const rowsAffected = await ApiKeyModel.revokeKey(req.params.keyId, req.user.id);

            if (rowsAffected === 0) {
                return res.status(404).json({ message: "Key not found or unauthorized." });
            }

            res.json({ message: "API Key revoked successfully." });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Server error" });
        }
    }

    static async getStats(req, res) {
        try {
            const apiUsage = await ApiKeyModel.getApiUsageStats(req.user.id);
            const logins = await ApiKeyModel.getLoginStats(req.user.email);

            res.json({
                apiUsage,
                logins
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Server error" });
        }
    }
}

module.exports = ApiKeyController;
