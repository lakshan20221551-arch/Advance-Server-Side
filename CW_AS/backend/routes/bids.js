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

// Helper to get ProfileID
async function getProfileId(userId, pool) {
    const result = await pool.request()
        .input("UserID", sql.Int, userId)
        .query("SELECT apd_profile_id FROM AAP_PROFILES_DETAILS WHERE apd_user_id = @UserID");
    return result.recordset.length > 0 ? result.recordset[0].apd_profile_id : null;
}

// --- POST: Place or Update a Blind Bid ---
router.post("/place-bid", authMiddleware, async (req, res) => {
    const { amount, targetDate } = req.body;
    const userId = req.user.id;

    if (!amount || !targetDate) {
        return res.status(400).json({ success: false, message: "Amount and Target Date are required" });
    }

    try {
        const pool = await poolPromise;
        const profileId = await getProfileId(userId, pool);

        if (!profileId) {
            return res.status(400).json({ success: false, message: "Profile not found. Please create your profile first." });
        }

        // Check if there's an existing bid to get the ID for the procedure's @ID parameter
        const bidCheck = await pool.request()
            .input("ProfileID", sql.Int, profileId)
            .input("TargetDate", sql.Date, targetDate)
            .query("SELECT ab_bid_id FROM AAP_BIDS WHERE ab_profile_id = @ProfileID AND ab_target_date = @TargetDate");
        
        const bidId = bidCheck.recordset.length > 0 ? bidCheck.recordset[0].ab_bid_id : 0;

        const result = await pool.request()
            .input("ID", sql.Int, bidId)
            .input("ProfileID", sql.Int, profileId)
            .input("TargetDate", sql.Date, targetDate)
            .input("BidAmount", sql.Decimal(18, 2), amount)
            .execute("PlaceBlindBid");

        const status = result.recordset[0];
        
        res.json({
            success: true,
            message: status.Message,
            biddingStatus: status.BiddingStatus
        });

    } catch (err) {
        const errorMessage = err.message || "";
        if (errorMessage.includes("MSG:")) {
            const cleanMessage = errorMessage.split("MSG:")[1].trim();
            return res.json({ success: true, message: cleanMessage }); // Return as success:true for green styling as requested
        }
        console.error("Bidding Error:", err);
        res.status(500).json({ success: false, message: "An error occurred while placing your bid." });
    }
});

// --- GET: Check current highest bid status for a date ---
router.get("/status/:date", authMiddleware, async (req, res) => {
    const targetDate = req.params.date;
    const userId = req.user.id;

    try {
        const pool = await poolPromise;
        const profileId = await getProfileId(userId, pool);

        if (!profileId) {
            return res.json({ success: false, message: "Profile not found." });
        }

        // Fetch the user's current bid amount for this date
        const userBidResult = await pool.request()
            .input("ProfileID", sql.Int, profileId)
            .input("TargetDate", sql.Date, targetDate)
            .query("SELECT ab_amount FROM AAP_BIDS WHERE ab_profile_id = @ProfileID AND ab_target_date = @TargetDate");

        if (userBidResult.recordset.length === 0) {
            return res.json({ success: true, biddingStatus: "No Bid", amount: 0 });
        }

        const userAmount = userBidResult.recordset[0].ab_amount;

        // Check if it's the current max
        const maxResult = await pool.request()
            .input("TargetDate", sql.Date, targetDate)
            .query("SELECT MAX(ab_amount) as MaxAmount FROM AAP_BIDS WHERE ab_target_date = @TargetDate");

        const maxAmount = maxResult.recordset[0].MaxAmount;
        const isWinning = userAmount >= maxAmount;

        res.json({
            success: true,
            biddingStatus: isWinning ? "Winning" : "Not Winning",
            amount: userAmount
        });

    } catch (err) {
        console.error("Bidding Status Error:", err);
        res.status(500).json({ success: false, message: "Error fetching bidding status" });
    }
});

// --- GET: Get Today's Alumni of the Day ---
router.get("/winner-today", async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .query(`
                SELECT TOP 1 u.auv_name, p.apd_bio, p.apd_profile_image, w.adw_winning_amount
                FROM AAP_ALUMNIOFTHE_DAY w
                JOIN AAP_PROFILES_DETAILS p ON w.adw_profile_id = p.apd_profile_id
                JOIN AAP_USERSDETAILS_VIEW u ON p.apd_user_id = u.auv_id
                WHERE w.adw_selection_date = CAST(GETDATE() AS DATE)
            `);

        if (result.recordset.length > 0) {
            const winner = result.recordset[0];
            let imageBase64 = null;
            if (winner.apd_profile_image) {
                imageBase64 = `data:image/jpeg;base64,${winner.apd_profile_image.toString('base64')}`;
            }

            res.json({
                success: true,
                winner: {
                    name: winner.auv_name,
                    bio: winner.apd_bio,
                    profileImage: imageBase64,
                    amount: winner.adw_winning_amount
                }
            });
        } else {
            res.json({ success: true, winner: null });
        }
    } catch (err) {
        console.error("Fetch Winner Error:", err);
        res.status(500).json({ success: false, message: "Error fetching today's winner" });
    }
});

module.exports = router;
