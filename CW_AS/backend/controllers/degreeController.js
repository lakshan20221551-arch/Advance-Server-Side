const DegreeModel = require("../models/degreeModel");

class DegreeController {
    static async getDegrees(req, res) {
        try {
            const degrees = await DegreeModel.getDegrees(req.user.id);
            res.json({ success: true, degrees });
        } catch (err) {
            console.error("Fetch Degree Error:", err);
            res.status(500).json({ success: false, message: "Error fetching degree details" });
        }
    }

    static async updateDegree(req, res) {
        const { degreeId, degreeName, university, startDate, endDate } = req.body;
        if (!degreeName || !university) {
            return res.status(400).json({ success: false, message: "Degree Name and University are required" });
        }
        try {
            await DegreeModel.insertUpdateDegree(degreeId, req.user.id, degreeName, university, startDate, endDate);
            res.json({ success: true, message: "Degree details saved successfully" });
        } catch (err) {
            const errorMessage = err.message || "";
            if (errorMessage.includes("MSG:")) {
                return res.json({ success: true, message: errorMessage.split("MSG:")[1].trim() });
            }
            console.error("Degree Error:", err);
            res.status(500).json({ success: false, message: "An error occurred while saving degree details." });
        }
    }

    static async deleteDegree(req, res) {
        try {
            await DegreeModel.deleteDegree(req.params.id, req.user.id);
            res.json({ success: true, message: "Degree record deleted successfully" });
        } catch (err) {
            const errorMessage = err.message || "";
            if (errorMessage.includes("MSG:")) {
                return res.json({ success: true, message: errorMessage.split("MSG:")[1].trim() });
            }
            console.error("Delete Degree Error:", err);
            res.status(500).json({ success: false, message: "An error occurred while deleting the record." });
        }
    }
}
module.exports = DegreeController;
