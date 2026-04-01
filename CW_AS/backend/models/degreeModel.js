const { sql, poolPromise } = require("../config/db");

class DegreeModel {
    static async getDegrees(userId) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input("UserID", sql.Int, userId)
            .query("SELECT adv_degree_id, adv_user_id, adv_degree_name, adv_university, adv_start_date, adv_end_date FROM AAP_DEGREEDETAILS_VIEW WHERE adv_user_id = @UserID");
        return result.recordset;
    }

    static async insertUpdateDegree(degreeId, userId, degreeName, university, startDate, endDate) {
        const pool = await poolPromise;
        await pool.request()
            .input("DegreeID", sql.Int, degreeId || 0)
            .input("UserID", sql.Int, userId)
            .input("DegreeName", sql.VarChar(1000), degreeName)
            .input("University", sql.VarChar(1000), university)
            .input("StartDate", sql.DateTime, startDate || null)
            .input("EndDate", sql.DateTime, endDate || null)
            .execute("InsertUpdateDegreeDetails");
    }

    static async deleteDegree(degreeId, userId) {
        const pool = await poolPromise;
        await pool.request()
            .input("DegreeID", sql.Int, degreeId)
            .input("UserID", sql.Int, userId)
            .execute("DeleteDegreeDetails");
    }
}
module.exports = DegreeModel;
