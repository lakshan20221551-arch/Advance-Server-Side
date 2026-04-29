

const express = require("express");
const router = express.Router();
const verifyApiKey = require("../middleware/verifyApiKey");
const PublicApiController = require("../controllers/publicApiController");

/**
 * @swagger
 * /api/public/featured-alumnus:
 *   get:
 *     summary: Retrieve the featured alumnus of the day
 *     description: Returns details of the featured alumnus profile. Requires a valid API Key with 'read:alumni_of_day' scope.
 *     security:
 *       - bearerAuth: []
 *       - apiKeyHeader: []
 *     parameters:
 *       - in: header
 *         name: x-api-key
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved the featured alumnus.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden. Insufficient permissions.
 *       404:
 *         description: No featured alumnus found.
 */
router.get("/featured-alumnus", verifyApiKey(['read:alumni_of_day']), PublicApiController.getFeaturedAlumnus);

module.exports = router;
