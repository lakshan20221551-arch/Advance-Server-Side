const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const DegreeController = require("../controllers/degreeController");

router.get("/", authMiddleware, DegreeController.getDegrees);
router.post("/degree-update", authMiddleware, DegreeController.updateDegree);
router.delete("/delete-degree/:id", authMiddleware, DegreeController.deleteDegree);

module.exports = router;
