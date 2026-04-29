const ApiKeyModel = require("../models/apiKeyModel");

const verifyApiKey = (scopes = []) => {
    return async (req, res, next) => {
        // Skip API key check if already authenticated as an admin (Internal Dashboard use)
        if (req.user && req.user.role === 'admin') {
            return next();
        }

        let apiKey = req.headers['x-api-key'] || req.header('x-api-key');

        if (!apiKey) {
            return res.status(401).json({ message: "Access Denied. No API key provided." });
        }

        try {
            const keyData = await ApiKeyModel.validateApiKey(apiKey);

            if (!keyData) {
                return res.status(401).json({ message: "Invalid API Key." });
            }

            if (keyData.IsRevoked) {
                return res.status(401).json({ message: "API Key has been revoked." });
            }

            // Granular permission system: check if scopes match the key's permissions
            const keyScopes = (keyData.Scopes || '').split(',').map(s => s.trim());
            const hasRequiredScope = scopes.length === 0 || scopes.every(s => keyScopes.includes(s));

            if (!hasRequiredScope) {
                return res.status(403).json({ 
                    message: "Forbidden. Insufficient permissions.",
                    requiredScopes: scopes,
                    providedScopes: keyScopes
                });
            }
            
            // Log the usage
            await ApiKeyModel.logKeyUsage(keyData.KeyID, req.originalUrl, req.ip || '');

            req.apiKeyData = keyData;
            next();
        } catch (err) {
            console.error("API Key Verification Error:", err);
            res.status(500).json({ message: "Server error" });
        }
    };
};

module.exports = verifyApiKey;
