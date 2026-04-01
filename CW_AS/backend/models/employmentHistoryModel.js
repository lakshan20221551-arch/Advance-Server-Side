const { sql, poolPromise } = require("../config/db");

class EmploymentHistoryModel {
    static async getEmployments(userId) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input("UserID", sql.Int, userId)
            .query("SELECT aev_employment_id, aev_user_id, aev_company, aev_position, aev_start_date, aev_end_date FROM AAP_EMPLOYMENTHISTORY_VIEW WHERE aev_user_id = @UserID");
        return result.recordset;
    }

    static async insertUpdateEmployment(employmentId, userId, company, position, startDate, endDate) {
        const pool = await poolPromise;
        await pool.request()
            .input("EmploymenID", sql.Int, employmentId || 0)
            .input("UserID", sql.Int, userId)
            .input("Company", sql.VarChar(1000), company)
            .input("Position", sql.VarChar(1000), position)
            .input("StartDate", sql.DateTime, startDate || null)
            .input("EndDate", sql.DateTime, endDate || null)
            .execute("InsertUpdateEmploymentHistoryDetails");
    }

    static async deleteEmployment(employmentId, userId) {
        const pool = await poolPromise;
        await pool.request()
            .input("EmploymenID", sql.Int, employmentId)
            .input("UserID", sql.Int, userId)
            .execute("DeleteEmploymentHistoryDetails");
    }
}
module.exports = EmploymentHistoryModel;
