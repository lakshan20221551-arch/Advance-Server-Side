const express = require('express');
const router = express.Router();
const verifyApiKey = require('../middleware/verifyApiKey');

/**
 * @swagger
 * /api/donations:
 *   get:
 *     summary: Get all donation records
 *     description: Returns a list of alumni donations. Requires 'read:donations' API scope.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 *       403:
 *         description: Forbidden
 */
router.get('/', verifyApiKey(['read:donations']), (req, res) => {
    res.json({
        message: "Donations data fetched successfully",
        donations: [
            { id: 1, alumnus: "John Doe", amount: 500, date: "2026-01-15" },
            { id: 2, alumnus: "Jane Smith", amount: 1000, date: "2026-02-10" }
        ]
    });
});

module.exports = router;
