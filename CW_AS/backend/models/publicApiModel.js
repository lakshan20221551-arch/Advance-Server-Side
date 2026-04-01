
const { poolPromise } = require("../config/db");

class PublicApiModel {
    static async getFeaturedAlumnus() {
        try {
            const pool = await poolPromise;
            // Trying to get featured 
            const result = await pool.request()
                .query(`
                    SELECT TOP 1 * 
                    FROM AAP_PROFILES_DETAILS 
                    WHERE apd_is_featured = 1 OR IsFeatured = 1 
                    ORDER BY apd_id DESC
                `); 
            
            return result.recordset[0] || null;
        } catch (err) {
            // Fallback: get recent
            try {
                const pool = await poolPromise;
                const fallbackResult = await pool.request().query("SELECT TOP 1 * FROM AAP_PROFILES_DETAILS ORDER BY apd_id DESC");
                return fallbackResult.recordset.length > 0 ? fallbackResult.recordset[0] : null;
            } catch (innerErr) {
                throw innerErr;
            }
        }
    }
}

module.exports = PublicApiModel;