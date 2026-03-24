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

// --- GET ROUTE: Fetch license details for the logged-in user ---
router.get("/", authMiddleware, async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input("UserID", sql.Int, req.user.id)
            .query("SELECT alv_license_id, alv_user_id, alv_name, alv_authority, alv_url, alv_completion_date FROM AAP_LICENSEDETAILS_VIEW WHERE alv_user_id = @UserID");

        res.json({
            success: true,
            licenses: result.recordset
        });
    } catch (err) {
        console.error("Fetch License Error:", err);
        res.status(500).json({ success: false, message: "Error fetching license details" });
    }
});

// --- POST ROUTE: Add or Update License (Unified Endpoint using Stored Procedure) ---
router.post("/license-update", authMiddleware, async (req, res) => {
    const { licenseId, name, authority, url, completionDate } = req.body;
    const userId = req.user.id;

    if (!name || !authority) {
        return res.status(400).json({ success: false, message: "License Name and Authority are required" });
    }

    try {
        const pool = await poolPromise;
        await pool.request()
            .input("LicenseID", sql.Int, licenseId || 0)
            .input("UserID", sql.Int, userId)
            .input("Name", sql.VarChar(1000), name)
            .input("Authority", sql.VarChar(1000), authority)
            .input("Url", sql.VarChar(1000), url || null)
            .input("CompletionDate", sql.DateTime, completionDate || null)
            .execute("InsertUpdateLicenseDetails");

        res.json({ success: true, message: "License details saved successfully" });
    } catch (err) {
        const errorMessage = err.message || "";
        if (errorMessage.includes("MSG:")) {
            const cleanMessage = errorMessage.split("MSG:")[1].trim();
            return res.json({ success: true, message: cleanMessage });
        }
        console.error("License Error:", err);
        res.status(500).json({ success: false, message: "An error occurred while saving license details." });
    }
});

// --- DELETE ROUTE: Delete License record ---
router.delete("/delete-license/:id", authMiddleware, async (req, res) => {
    const licenseId = req.params.id;
    const userId = req.user.id;

    try {
        const pool = await poolPromise;
        await pool.request()
            .input("UserID", sql.Int, userId)
            .input("LicenseID", sql.Int, licenseId)
            .execute("DeleteLicenseDetails");

        res.json({ success: true, message: "License record deleted successfully" });
    } catch (err) {
        const errorMessage = err.message || "";
        if (errorMessage.includes("MSG:")) {
            const cleanMessage = errorMessage.split("MSG:")[1].trim();
            return res.json({ success: true, message: cleanMessage });
        }
        console.error("Delete License Error:", err);
        res.status(500).json({ success: false, message: "An error occurred while deleting the record." });
    }
});

module.exports = router;
