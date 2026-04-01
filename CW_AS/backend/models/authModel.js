const { sql, poolPromise } = require("../config/db");

class AuthModel {
    static async registerUser(email, hashedPassword) {
        const pool = await poolPromise;
        await pool.request()
            .input("Email", sql.VarChar(1000), email)
            .input("Password", sql.VarChar(4000), hashedPassword)
            .execute("InsertUser");
    }

    static async getUserByEmail(email) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input("Email", sql.VarChar, email)
            .query("SELECT * FROM AAP_USERSDETAILS_VIEW WHERE auv_email = @Email");
        return result.recordset.length > 0 ? result.recordset[0] : null;
    }

    static async logLoginStat(email, ipAddress, status) {
        const pool = await poolPromise;
        await pool.request()
            .input("Email", sql.VarChar, email)
            .input("IPAddress", sql.VarChar, ipAddress)
            .input("Status", sql.VarChar, status)
            .query("INSERT INTO AAP_LOGIN_STATS (als_email, als_ip_address, als_status) VALUES (@Email, @IPAddress, @Status)");
    }

    static async resetPassword(email, hashedPassword) {
        const pool = await poolPromise;
        await pool.request()
            .input("Email", sql.VarChar(1000), email)
            .input("Password", sql.VarChar(4000), hashedPassword)
            .execute("dbo.ResetPassword");
    }
}

module.exports = AuthModel;
