const { sql, poolPromise } = require("../config/db");

class ProfileModel {
    static async getProfileByUserId(userId) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input("UserID", sql.Int, userId)
            .query("SELECT * FROM AAP_PROFILES_DETAILS WHERE apd_user_id = @UserID");
        return result.recordset.length > 0 ? result.recordset[0] : null;
    }

    static async insertUpdateProfile(userId, fullName, bio, linkedInUrl, profileImageBuffer) {
        const pool = await poolPromise;
        await pool.request()
            .input("UserID", sql.Int, userId)
            .input("FullName", sql.VarChar(4000), fullName || null)
            .input("Bio", sql.VarChar(4000), bio || null)
            .input("LinkinURL", sql.VarChar(sql.MAX), linkedInUrl || null)
            .input("ProfileImage", sql.Image, profileImageBuffer)
            .execute("InsertUpdateProfileDetails");
    }
}
module.exports = ProfileModel;
