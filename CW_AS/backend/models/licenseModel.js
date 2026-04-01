const { sql, poolPromise } = require("../config/db");

class LicenseModel {
    static async getLicenses(userId) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input("UserID", sql.Int, userId)
            .query("SELECT alv_license_id, alv_user_id, alv_name, alv_authority, alv_url, alv_completion_date FROM AAP_LICENSEDETAILS_VIEW WHERE alv_user_id = @UserID");
        return result.recordset;
    }

    static async insertUpdateLicense(licenseId, userId, name, authority, url, completionDate) {
        const pool = await poolPromise;
        await pool.request()
            .input("LicenseID", sql.Int, licenseId || 0)
            .input("UserID", sql.Int, userId)
            .input("Name", sql.VarChar(1000), name)
            .input("Authority", sql.VarChar(1000), authority)
            .input("Url", sql.VarChar(1000), url || null)
            .input("CompletionDate", sql.DateTime, completionDate || null)
            .execute("InsertUpdateLicenseDetails");
    }

    static async deleteLicense(licenseId, userId) {
        const pool = await poolPromise;
        await pool.request()
            .input("UserID", sql.Int, userId)
            .input("LicenseID", sql.Int, licenseId)
            .execute("DeleteLicenseDetails");
    }
}
module.exports = LicenseModel;
