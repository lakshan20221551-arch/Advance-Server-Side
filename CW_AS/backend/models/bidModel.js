const { sql, poolPromise } = require("../config/db");

class BidModel {
    static async getProfileId(userId) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input("UserID", sql.Int, userId)
            .query("SELECT apd_profile_id FROM AAP_PROFILES_DETAILS WHERE apd_user_id = @UserID");
        return result.recordset.length > 0 ? result.recordset[0].apd_profile_id : null;
    }

    static async checkExistingBid(profileId, targetDate) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input("ProfileID", sql.Int, profileId)
            .input("TargetDate", sql.Date, targetDate)
            .query("SELECT ab_bid_id, ab_amount FROM AAP_BIDS WHERE ab_profile_id = @ProfileID AND ab_target_date = @TargetDate");
        return result.recordset;
    }

    static async placeBid(bidId, profileId, targetDate, amount) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input("ID", sql.Int, bidId)
            .input("ProfileID", sql.Int, profileId)
            .input("TargetDate", sql.Date, targetDate)
            .input("BidAmount", sql.Decimal(18, 2), amount)
            .execute("PlaceBlindBid");
        return result.recordset[0];
    }

    static async getMaxBid(targetDate) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input("TargetDate", sql.Date, targetDate)
            .query("SELECT MAX(ab_amount) as MaxAmount FROM AAP_BIDS WHERE ab_target_date = @TargetDate");
        return result.recordset[0].MaxAmount || 0;
    }

    static async getWinnerToday() {
        const pool = await poolPromise;
        const result = await pool.request()
            .query(`
                SELECT TOP 1 p.apd_full_name, p.apd_bio, p.apd_profile_image, w.adw_winning_amount
                FROM AAP_ALUMNIOFTHE_DAY w
                JOIN AAP_PROFILES_DETAILS p ON w.adw_profile_id = p.apd_profile_id
                JOIN AAP_USERSDETAILS_VIEW u ON p.apd_user_id = u.auv_id
                WHERE w.adw_selection_date = CAST(GETDATE() AS DATE)
            `);
        return result.recordset.length > 0 ? result.recordset[0] : null;
    }
}
module.exports = BidModel;
