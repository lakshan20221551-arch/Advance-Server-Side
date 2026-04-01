const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const ShortCourseController = require("../controllers/shortCourseController");

router.get("/", authMiddleware, ShortCourseController.getCourses);
router.post("/course-update", authMiddleware, ShortCourseController.updateCourse);
router.delete("/delete-course/:id", authMiddleware, ShortCourseController.deleteCourse);

module.exports = router;
