const { sql, poolPromise } = require("../config/db");

class ApiKeyModel {
    static async createApiKey(userId, clientName, apiKey) {
        const pool = await poolPromise;
        await pool.request()
            .input("UserID", sql.Int, userId)
            .input("ClientName", sql.VarChar, clientName)
            .input("ApiKey", sql.VarChar, apiKey)
            .query("INSERT INTO AAP_API_KEYS (aak_user_id, aak_name, aak_api_key) VALUES (@UserID, @ClientName, @ApiKey)");
    }

    static async getKeysByUser(userId) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input("UserID", sql.Int, userId)
            .query("SELECT aak_key_id AS KeyID, aak_name AS ClientName, aak_api_key AS ApiKey, aak_is_revoked AS IsRevoked, aak_created_date AS CreatedAt FROM AAP_API_KEYS WHERE aak_user_id = @UserID");
        return result.recordset;
    }

    static async revokeKey(keyId, userId) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input("KeyID", sql.Int, keyId)
            .input("UserID", sql.Int, userId)
            .query("UPDATE AAP_API_KEYS SET aak_is_revoked = 1 WHERE aak_key_id = @KeyID AND aak_user_id = @UserID");
        return result.rowsAffected[0];
    }

    static async validateApiKey(apiKey) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input("ApiKey", sql.VarChar, apiKey)
            .query("SELECT aak_key_id AS KeyID, aak_user_id AS UserID, aak_name AS ClientName, aak_is_revoked AS IsRevoked FROM AAP_API_KEYS WHERE aak_api_key = @ApiKey");
        return result.recordset.length > 0 ? result.recordset[0] : null;
    }

    static async logKeyUsage(keyId, endpoint, ipAddress) {
        const pool = await poolPromise;
        await pool.request()
            .input("KeyID", sql.Int, keyId)
            .input("Endpoint", sql.VarChar, endpoint)
            .input("IPAddress", sql.VarChar, ipAddress)
            .query("INSERT INTO AAP_APIKEY_USAGE (aau_key_id, aau_endpoint_accessed, aau_ip_address) VALUES (@KeyID, @Endpoint, @IPAddress)");
    }

    static async getApiUsageStats(userId) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input("UserID", sql.Int, userId)
            .query(`
                SELECT u.aau_endpoint_accessed AS EndpointAccessed, u.aau_accessed_date AS AccessedAt, u.aau_ip_address AS IPAddress, k.aak_name AS ClientName
                FROM AAP_APIKEY_USAGE u
                JOIN AAP_API_KEYS k ON u.aau_key_id = k.aak_key_id
                WHERE k.aak_user_id = @UserID
                ORDER BY u.aau_accessed_date DESC
            `);
        return result.recordset;
    }

    static async getLoginStats(email) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input("Email", sql.VarChar, email)
            .query(`
                SELECT als_email AS Email, als_ip_address AS IPAddress, als_login_time AS LoginTime, als_status AS Status
                FROM AAP_LOGIN_STATS
                WHERE als_email = @Email
                ORDER BY als_login_time DESC
            `);
        return result.recordset;
    }
}

module.exports = ApiKeyModel;
