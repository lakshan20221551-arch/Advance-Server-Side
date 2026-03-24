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

// --- GET ROUTE: Fetch short course details for the logged-in user ---
router.get("/", authMiddleware, async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input("UserID", sql.Int, req.user.id)
            .query("SELECT asv_course_id, asv_user_id, asv_name, asv_provider, asv_url, asv_completion_date FROM AAP_SHORTCOURSES_VIEW WHERE asv_user_id = @UserID");

        res.json({
            success: true,
            courses: result.recordset
        });
    } catch (err) {
        console.error("Fetch Short Course Error:", err);
        res.status(500).json({ success: false, message: "Error fetching short course details" });
    }
});

// --- POST ROUTE: Add or Update Short Course (Unified Endpoint using Stored Procedure) ---
router.post("/course-update", authMiddleware, async (req, res) => {
    const { courseId, name, provider, url, completionDate } = req.body;
    const userId = req.user.id;

    if (!name || !provider) {
        return res.status(400).json({ success: false, message: "Course Name and Provider are required" });
    }

    try {
        const pool = await poolPromise;
        await pool.request()
            .input("CourseID", sql.Int, courseId || 0)
            .input("UserID", sql.Int, userId)
            .input("Name", sql.VarChar(1000), name)
            .input("Provider", sql.VarChar(1000), provider)
            .input("Url", sql.VarChar(1000), url || null)
            .input("CompletionDate", sql.DateTime, completionDate || null)
            .execute("InsertUpdateShortCourseDetails");

        res.json({ success: true, message: "Short course details saved successfully" });
    } catch (err) {
        console.error("Short Course Error:", err);
        res.status(500).json({ success: false, message: "An error occurred while saving short course details." });
    }
});

// --- DELETE ROUTE: Delete Short Course record ---
router.delete("/delete-course/:id", authMiddleware, async (req, res) => {
    const courseId = req.params.id;
    const userId = req.user.id;

    try {
        const pool = await poolPromise;
        await pool.request()
            .input("UserID", sql.Int, userId)
            .input("CourseID", sql.Int, courseId)
            .execute("DeleteShortCourseDetails");

        res.json({ success: true, message: "Short course record deleted successfully" });
    } catch (err) {
        console.error("Delete Short Course Error:", err);
        res.status(500).json({ success: false, message: "An error occurred while deleting the record." });
    }
});

module.exports = router;
