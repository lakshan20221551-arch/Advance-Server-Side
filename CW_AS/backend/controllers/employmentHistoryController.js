const EmploymentHistoryModel = require("../models/employmentHistoryModel");

class EmploymentHistoryController {
    static async getEmployments(req, res) {
        try {
            const employments = await EmploymentHistoryModel.getEmployments(req.user.id);
            res.json({ success: true, employments });
        } catch (err) {
            console.error("Fetch Employment History Error:", err);
            res.status(500).json({ success: false, message: "Error fetching employment history details" });
        }
    }

    static async updateEmployment(req, res) {
        const { employmentId, company, position, startDate, endDate } = req.body;
        if (!company || !position) {
            return res.status(400).json({ success: false, message: "Company and Position are required" });
        }
        try {
            await EmploymentHistoryModel.insertUpdateEmployment(employmentId, req.user.id, company, position, startDate, endDate);
            res.json({ success: true, message: "Employment history details saved successfully" });
        } catch (err) {
            const errorMessage = err.message || "";
            if (errorMessage.includes("MSG:")) {
                return res.json({ success: true, message: errorMessage.split("MSG:")[1].trim() });
            }
            console.error("Employment Error:", err);
            res.status(500).json({ success: false, message: "An error occurred while saving employment history details." });
        }
    }

    static async deleteEmployment(req, res) {
        try {
            await EmploymentHistoryModel.deleteEmployment(req.params.id, req.user.id);
            res.json({ success: true, message: "Employment record deleted successfully" });
        } catch (err) {
            const errorMessage = err.message || "";
            if (errorMessage.includes("MSG:")) {
                return res.json({ success: true, message: errorMessage.split("MSG:")[1].trim() });
            }
            console.error("Delete Employment Error:", err);
            res.status(500).json({ success: false, message: "An error occurred while deleting the record." });
        }
    }
}
module.exports = EmploymentHistoryController;
