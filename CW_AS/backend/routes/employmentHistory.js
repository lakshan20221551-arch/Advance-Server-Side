const express = require("express");
const router = express.Router();
const { sql, poolPromise } = require("../config/db");
const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized. Please login again." });
    }
    const token = authHeader.split(" ")[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ message: "Invalid or expired token." });
    }
};

// --- GET ROUTE: Fetch employment history details for the logged-in user ---
router.get("/", authMiddleware, async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input("UserID", sql.Int, req.user.id)
            .query("SELECT aev_employment_id, aev_user_id, aev_company, aev_position, aev_start_date, aev_end_date FROM AAP_EMPLOYMENTHISTORY_VIEW WHERE aev_user_id = @UserID");

        res.json({
            success: true,
            employments: result.recordset
        });
    } catch (err) {
        console.error("Fetch Employment History Error:", err);
        res.status(500).json({ success: false, message: "Error fetching employment history details" });
    }
});

// --- POST ROUTE: Add or Update Employment History (Unified Endpoint using Stored Procedure) ---
router.post("/employment-update", authMiddleware, async (req, res) => {
    const { employmentId, company, position, startDate, endDate } = req.body;
    const userId = req.user.id;

    if (!company || !position) {
        return res.status(400).json({ success: false, message: "Company and Position are required" });
    }

    try {
        const pool = await poolPromise;
        await pool.request()
            .input("EmploymenID", sql.Int, employmentId || 0)
            .input("UserID", sql.Int, userId)
            .input("Company", sql.VarChar(1000), company)
            .input("Position", sql.VarChar(1000), position)
            .input("StartDate", sql.DateTime, startDate || null)
            .input("EndDate", sql.DateTime, endDate || null)
            .execute("InsertUpdateEmploymentHistoryDetails");

        res.json({ success: true, message: "Employment history details saved successfully" });
    } catch (err) {
        const errorMessage = err.message || "";
        if (errorMessage.includes("MSG:")) {
            const cleanMessage = errorMessage.split("MSG:")[1].trim();
            return res.json({ success: true, message: cleanMessage });
        }
        console.error("Employment Error:", err);
        res.status(500).json({ success: false, message: "An error occurred while saving employment history details." });
    }
});

// --- DELETE ROUTE: Delete Employment record ---
router.delete("/delete-employment/:id", authMiddleware, async (req, res) => {
    const employmentId = req.params.id;
    const userId = req.user.id;

    try {
        const pool = await poolPromise;
        await pool.request()
            .input("EmploymenID", sql.Int, employmentId)
            .input("UserID", sql.Int, userId)
            .execute("DeleteEmploymentHistoryDetails");

        res.json({ success: true, message: "Employment record deleted successfully" });
    } catch (err) {
        const errorMessage = err.message || "";
        if (errorMessage.includes("MSG:")) {
            const cleanMessage = errorMessage.split("MSG:")[1].trim();
            return res.json({ success: true, message: cleanMessage });
        }
        console.error("Delete Employment Error:", err);
        res.status(500).json({ success: false, message: "An error occurred while deleting the record." });
    }
});

module.exports = router;
