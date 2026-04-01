const ShortCourseModel = require("../models/shortCourseModel");

class ShortCourseController {
    static async getCourses(req, res) {
        try {
            const courses = await ShortCourseModel.getCourses(req.user.id);
            res.json({ success: true, courses });
        } catch (err) {
            console.error("Fetch Short Course Error:", err);
            res.status(500).json({ success: false, message: "Error fetching short course details" });
        }
    }

    static async updateCourse(req, res) {
        const { courseId, name, provider, url, completionDate } = req.body;
        if (!name || !provider) {
            return res.status(400).json({ success: false, message: "Course Name and Provider are required" });
        }
        try {
            await ShortCourseModel.insertUpdateCourse(courseId, req.user.id, name, provider, url, completionDate);
            res.json({ success: true, message: "Short course details saved successfully" });
        } catch (err) {
            const errorMessage = err.message || "";
            if (errorMessage.includes("MSG:")) {
                return res.json({ success: true, message: errorMessage.split("MSG:")[1].trim() });
            }
            console.error("Short Course Error:", err);
            res.status(500).json({ success: false, message: "An error occurred while saving short course details." });
        }
    }

    static async deleteCourse(req, res) {
        try {
            await ShortCourseModel.deleteCourse(req.params.id, req.user.id);
            res.json({ success: true, message: "Short course record deleted successfully" });
        } catch (err) {
            const errorMessage = err.message || "";
            if (errorMessage.includes("MSG:")) {
                return res.json({ success: true, message: errorMessage.split("MSG:")[1].trim() });
            }
            console.error("Delete Short Course Error:", err);
            res.status(500).json({ success: false, message: "An error occurred while deleting the record." });
        }
    }
}
module.exports = ShortCourseController;
