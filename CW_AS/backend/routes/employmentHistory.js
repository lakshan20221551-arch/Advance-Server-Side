const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const EmploymentHistoryController = require("../controllers/employmentHistoryController");

router.get("/", authMiddleware, EmploymentHistoryController.getEmployments);
router.post("/employment-update", authMiddleware, EmploymentHistoryController.updateEmployment);
router.delete("/delete-employment/:id", authMiddleware, EmploymentHistoryController.deleteEmployment);

module.exports = router;
