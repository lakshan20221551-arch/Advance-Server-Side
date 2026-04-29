const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const AlumniController = require("../controllers/alumniController");

/**
 * @swagger
 * /api/alumni:
 *   get:
 *     summary: Get all alumni with filters
 *     description: Returns a list of alumni filtered by programme, graduation year, and industry.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: programme
 *         schema:
 *           type: string
 *       - in: query
 *         name: graduationYear
 *         schema:
 *           type: integer
 *       - in: query
 *         name: sector
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 */
router.get("/", authMiddleware, AlumniController.getAlumniList);

module.exports = router;
