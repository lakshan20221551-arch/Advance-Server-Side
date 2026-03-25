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

// --- GET ROUTE: Fetch certificate details for the logged-in user ---
router.get("/", authMiddleware, async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input("UserID", sql.Int, req.user.id)
            .query("SELECT acv_certification_id, acv_user_id, acv_certification_name, acv_issuing_organization, acv_issue_date FROM AAP_CERTIFICATEDETAILS_VIEW WHERE acv_user_id = @UserID");

        res.json({
            success: true,
            certificates: result.recordset
        });
    } catch (err) {
        console.error("Fetch certificate Error:", err);
        res.status(500).json({ success: false, message: "Error fetching certificate details" });
    }
});

// --- POST/PUT ROUTE: Add or Update Certificate (Unified Endpoint using Stored Procedure) ---
router.post("/certificate-update", authMiddleware, async (req, res) => {
    const { certificationId, certificationName, issuingOrganization, issueDate } = req.body;
    const userId = req.user.id;

    if (!certificationName || !issuingOrganization) {
        return res.status(400).json({ success: false, message: "Certification Name and Issuing Organization are required" });
    }

    try {
        const pool = await poolPromise;
        await pool.request()
            .input("CertificationID", sql.Int, certificationId || 0) // Pass 0 for new certificates
            .input("UserID", sql.Int, userId)
            .input("CertificationName", sql.VarChar(1000), certificationName)
            .input("IssuingOrganization", sql.VarChar(1000), issuingOrganization)
            .input("IssueDate", sql.DateTime, issueDate || null)
            .execute("InsertUpdateCertificateDetails");

        res.json({ success: true, message: "Certificate details saved successfully" });
    } catch (err) {
        const errorMessage = err.message || "";
        if (errorMessage.includes("MSG:")) {
            const cleanMessage = errorMessage.split("MSG:")[1].trim();
            return res.json({ success: true, message: cleanMessage });
        }
        console.error("Certificate Error:", err);
        res.status(500).json({ success: false, message: "An error occurred while saving certificate details." });
    }
});

// --- DELETE ROUTE: Delete Certificate record ---
router.delete("/delete-certificate/:id", authMiddleware, async (req, res) => {
    const certificationId = req.params.id;
    const userId = req.user.id;

    try {
        const pool = await poolPromise;
        await pool.request()
            .input("UserID", sql.Int, userId)
            .input("CertificationID", sql.Int, certificationId)
            .execute("DeleteCertificateDetails");

        res.json({ success: true, message: "Certificate record deleted successfully" });
    } catch (err) {
        const errorMessage = err.message || "";
        if (errorMessage.includes("MSG:")) {
            const cleanMessage = errorMessage.split("MSG:")[1].trim();
            return res.json({ success: true, message: cleanMessage });
        }
        console.error("Delete Certificate Error:", err);
        res.status(500).json({ success: false, message: "An error occurred while deleting the record." });
    }
});

module.exports = router;
