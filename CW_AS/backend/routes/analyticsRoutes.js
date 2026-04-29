// server/routes/analyticsRoutes.js
const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const verifyToken = require('../middleware/authMiddleware');
const verifyApiKey = require('../middleware/verifyApiKey');
const requireRole = require('../middleware/requireRole');

/**
 * @swagger
 * /api/analytics/filters:
 *   get:
 *     summary: Fetch dynamic options for dashboard dropdowns
 *     description: Returns lists of programmes, years, and sectors available for filtering. Requires admin role and valid API key.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: x-api-key
 *         required: true
 *         schema:
 *           type: string
 *         description: API Key for analytics access
 *     responses:
 *       200:
 *         description: Successfully fetched filter options.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden. Insufficient permissions.
 */
router.get(
  '/filters',
  verifyToken,
  // Accessible to all verified users to populate directory filters
  analyticsController.getFilterOptions
);

/**
 * @swagger
 * /api/analytics:
 *   get:
 *     summary: Main dashboard analytics data
 *     description: Returns chart data and summary metrics based on filters. Requires admin role and valid API key.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: x-api-key
 *         required: true
 *         schema:
 *           type: string
 *         description: API Key for analytics access
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
 *         description: Successfully fetched analytics data.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden.
 */
router.get(
  '/', 
  verifyToken, 
  requireRole('admin'), 
  verifyApiKey(['read:analytics']),
  analyticsController.getDashboardAnalytics
);

module.exports = router;
