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

// --- GET ROUTE: Fetch degree details for the logged-in user ---
router.get("/", authMiddleware, async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input("UserID", sql.Int, req.user.id)
            .query("SELECT adv_degree_id, adv_user_id, adv_degree_name, adv_university, adv_start_date, adv_end_date FROM AAP_DEGREEDETAILS_VIEW WHERE adv_user_id = @UserID");

        res.json({
            success: true,
            degrees: result.recordset
        });
    } catch (err) {
        console.error("Fetch Degree Error:", err);
        res.status(500).json({ success: false, message: "Error fetching degree details" });
    }
});

// --- POST/PUT ROUTE: Add or Update Degree (Unified Endpoint using Stored Procedure) ---
router.post("/degree-update", authMiddleware, async (req, res) => {
    const { degreeId, degreeName, university, startDate, endDate } = req.body;
    const userId = req.user.id;

    if (!degreeName || !university) {
        return res.status(400).json({ success: false, message: "Degree Name and University are required" });
    }

    try {
        const pool = await poolPromise;
        await pool.request()
            .input("DegreeID", sql.Int, degreeId || 0)
            .input("UserID", sql.Int, userId)
            .input("DegreeName", sql.VarChar(1000), degreeName)
            .input("University", sql.VarChar(1000), university)
            .input("StartDate", sql.DateTime, startDate || null)
            .input("EndDate", sql.DateTime, endDate || null)
            .execute("InsertUpdateDegreeDetails");

        res.json({ success: true, message: "Degree details saved successfully" });
    } catch (err) {
        const errorMessage = err.message || "";
        if (errorMessage.includes("MSG:")) {
            const cleanMessage = errorMessage.split("MSG:")[1].trim();
            return res.status(400).json({ success: false, message: cleanMessage });
        }
        console.error("Degree Error:", err);
        res.status(500).json({ success: false, message: "An error occurred while saving degree details." });
    }
});

// --- DELETE ROUTE: Delete Degree record ---
router.delete("/delete-degree/:id", authMiddleware, async (req, res) => {
    const degreeId = req.params.id;
    const userId = req.user.id;

    try {
        const pool = await poolPromise;
        await pool.request()
            .input("UserID", sql.Int, userId)
            .input("DegreeID", sql.Int, degreeId)
            .execute("DeleteDegreeDetails");

        res.json({ success: true, message: "Degree record deleted successfully" });
    } catch (err) {
        console.error("Delete Degree Error:", err);
        res.status(500).json({ success: false, message: "An error occurred while deleting the record." });
    }
});

module.exports = router;
