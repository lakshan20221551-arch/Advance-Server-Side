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
            .query("SELECT ab_bid_id, ab_amount FROM AAP_BIDS WHERE ab_profile_id = @ProfileID AND ab_target_date = @TargetDate AND (ab_status = 'Pending' OR ab_status IS NULL)");
        return result.recordset;
    }

    static async getMonthlyAppearances(profileId) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input("ProfileID", sql.Int, profileId)
            .query(`
                SELECT COUNT(*) as Appearances 
                FROM AAP_ALUMNIOFTHE_DAY 
                WHERE adw_profile_id = @ProfileID 
                AND MONTH(adw_selection_date) = MONTH(GETDATE()) 
                AND YEAR(adw_selection_date) = YEAR(GETDATE())
            `);
        return result.recordset[0].Appearances || 0;
    }

    static async placeBid(bidId, profileId, targetDate, amount) {
        const pool = await poolPromise;
        if (bidId > 0) {
            // increase existing bid
            await pool.request()
                .input("ID", sql.Int, bidId)
                .input("BidAmount", sql.Decimal(18, 2), amount)
                .query("UPDATE AAP_BIDS SET ab_amount = ab_amount + @BidAmount WHERE ab_bid_id = @ID");
            return { Message: "Bid updated successfully", BiddingStatus: "Success" };
        } else {
            // create new bid
            try {
                // Check if status column exists or not, but typically we can try catching error or just use simple insert
                await pool.request()
                    .input("ProfileID", sql.Int, profileId)
                    .input("TargetDate", sql.Date, targetDate)
                    .input("BidAmount", sql.Decimal(18, 2), amount)
                    .query("INSERT INTO AAP_BIDS (ab_profile_id, ab_target_date, ab_amount, ab_status) VALUES (@ProfileID, @TargetDate, @BidAmount, 'Pending')");
                return { Message: "Bid placed successfully", BiddingStatus: "Success" };
            } catch (err) {
                 // fallback if ab_status does not exist
                 await pool.request()
                    .input("ProfileID", sql.Int, profileId)
                    .input("TargetDate", sql.Date, targetDate)
                    .input("BidAmount", sql.Decimal(18, 2), amount)
                    .query("INSERT INTO AAP_BIDS (ab_profile_id, ab_target_date, ab_amount) VALUES (@ProfileID, @TargetDate, @BidAmount)");
                return { Message: "Bid placed successfully", BiddingStatus: "Success" };
            }
        }
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
                AND (w.adw_status = 'Active' OR w.adw_status IS NULL)
            `);
        return result.recordset.length > 0 ? result.recordset[0] : null;
    }

    static async getHistory(profileId) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input("ProfileID", sql.Int, profileId)
            .query("SELECT ab_bid_id as bidId, ab_target_date as targetDate, ab_amount as amount, ab_status as status FROM AAP_BIDS WHERE ab_profile_id = @ProfileID ORDER BY ab_target_date DESC");
        return result.recordset;
    }

    static async cancelBid(bidId, profileId) {
        const pool = await poolPromise;
        await pool.request()
            .input("BidID", sql.Int, bidId)
            .input("ProfileID", sql.Int, profileId)
            .query("UPDATE AAP_BIDS SET ab_status = 'Cancelled' WHERE ab_bid_id = @BidID AND ab_profile_id = @ProfileID AND ab_status = 'Pending'");
    }
}
module.exports = BidModel;
