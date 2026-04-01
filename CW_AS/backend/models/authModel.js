const { sql, poolPromise } = require("../config/db");

class AuthModel {
    /** REGISTRATION & VERIFICATION */
    static async registerUser(email, hashedPassword) {
        const pool = await poolPromise;
        // Exisiting creation
        await pool.request()
            .input("Email", sql.VarChar(1000), email)
            .input("Password", sql.VarChar(4000), hashedPassword)
            .execute("InsertUser");
    }

    static async setVerifyToken(email, token, expiry) {
        const pool = await poolPromise;
        // We update the underlying AAP_USERS table precisely where the email matches
        await pool.request()
            .input("Email", sql.VarChar(1000), email)
            .input("Token", sql.VarChar(255), token)
            .input("Expiry", sql.DateTime, expiry)
            .query(`
                UPDATE AAP_USERS_DETAILS
                SET aud_verify_token = @Token, aud_verify_token_expiry = @Expiry 
                WHERE aud_email = @Email
            `);
    }

    static async getUserByVerifyToken(token) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input("Token", sql.VarChar(255), token)
            .query("SELECT * FROM AAP_USERS_DETAILS WHERE aud_verify_token = @Token");
        return result.recordset.length > 0 ? result.recordset[0] : null;
    }

    static async verifyUserByToken(token) {
        const pool = await poolPromise;
        await pool.request()
            .input("Token", sql.VarChar(255), token)
            .query(`
                UPDATE AAP_USERS_DETAILS
                SET aud_is_verified = 1, aud_verify_token = NULL, aud_verify_token_expiry = NULL 
                WHERE aud_verify_token = @Token
            `);
    }

    /** LOGIN & AUTHENTICATION */
    static async getUserByEmail(email) {
        const pool = await poolPromise;
        // Retrieves viewing identity but joins raw table to check `au_is_verified` immediately
        const result = await pool.request()
            .input("Email", sql.VarChar, email)
            .query(`
                SELECT TOP 1 v.*, ISNULL(u.aud_is_verified, 0) as isVerified 
                FROM AAP_USERSDETAILS_VIEW v
                LEFT JOIN AAP_USERS_DETAILS u ON v.auv_email = u.aud_email 
                WHERE v.auv_email = @Email
            `);
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

    /** PASSWORD RESET */
    static async setResetToken(email, token, expiry) {
        const pool = await poolPromise;
        await pool.request()
            .input("Email", sql.VarChar(1000), email)
            .input("Token", sql.VarChar(255), token)
            .input("Expiry", sql.DateTime, expiry)
            .query(`
                UPDATE AAP_USERS_DETAILS
                SET aud_reset_token = @Token, aud_reset_token_expiry = @Expiry 
                WHERE aud_email = @Email OR email = @Email
            `);
    }

    static async getUserByResetToken(token) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input("Token", sql.VarChar(255), token)
            .query("SELECT * FROM AAP_USERS_DETAILS WHERE aud_reset_token = @Token");
        return result.recordset.length > 0 ? result.recordset[0] : null;
    }

    static async updatePasswordByToken(token, hashedPassword) {
        const pool = await poolPromise;
        await pool.request()
            .input("Token", sql.VarChar(255), token)
            .input("Password", sql.VarChar(4000), hashedPassword)
            .query(`
                UPDATE AAP_USERS_DETAILS 
                SET aud_password = @Password, aud_reset_token = NULL, aud_reset_token_expiry = NULL 
                WHERE aud_reset_token = @Token
            `);
    }

    /** SECURE LOGOUT & SESSION MANAGEMENT (BLACKLISTING) */
    static async blacklistToken(token, expiry) {
        const pool = await poolPromise;
        await pool.request()
            .input("Token", sql.VarChar(1000), token)
            .input("ExpiryDate", sql.DateTime, expiry)
            .query("INSERT INTO AAP_TOKEN_BLACKLIST (atb_token, atb_expires_at) VALUES (@Token, @ExpiryDate)");
    }

    static async isTokenBlacklisted(token) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input("Token", sql.VarChar(1000), token)
            .query("SELECT * FROM AAP_TOKEN_BLACKLIST WHERE atb_token = @Token");
        return result.recordset.length > 0;
    }
}

module.exports = AuthModel;
