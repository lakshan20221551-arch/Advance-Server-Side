const LicenseModel = require("../models/licenseModel");

class LicenseController {
    static async getLicenses(req, res) {
        try {
            const licenses = await LicenseModel.getLicenses(req.user.id);
            res.json({ success: true, licenses });
        } catch (err) {
            console.error("Fetch License Error:", err);
            res.status(500).json({ success: false, message: "Error fetching license details" });
        }
    }

    static async updateLicense(req, res) {
        const { licenseId, name, authority, url, completionDate } = req.body;
        if (!name || !authority) {
            return res.status(400).json({ success: false, message: "License Name and Authority are required" });
        }
        try {
            await LicenseModel.insertUpdateLicense(licenseId, req.user.id, name, authority, url, completionDate);
            res.json({ success: true, message: "License details saved successfully" });
        } catch (err) {
            const errorMessage = err.message || "";
            if (errorMessage.includes("MSG:")) {
                return res.json({ success: true, message: errorMessage.split("MSG:")[1].trim() });
            }
            console.error("License Error:", err);
            res.status(500).json({ success: false, message: "An error occurred while saving license details." });
        }
    }

    static async deleteLicense(req, res) {
        try {
            await LicenseModel.deleteLicense(req.params.id, req.user.id);
            res.json({ success: true, message: "License record deleted successfully" });
        } catch (err) {
            const errorMessage = err.message || "";
            if (errorMessage.includes("MSG:")) {
                return res.json({ success: true, message: errorMessage.split("MSG:")[1].trim() });
            }
            console.error("Delete License Error:", err);
            res.status(500).json({ success: false, message: "An error occurred while deleting the record." });
        }
    }
}
module.exports = LicenseController;
