const { sql, poolPromise } = require("../config/db");

class AlumniModel {
    static async getAllAlumni(filters = {}) {
        const pool = await poolPromise;
        const { programme, graduationYear, sector } = filters;

        let conditions = ["u.aud_is_verified = 1", "u.aud_status IS NULL"];
        if (programme) conditions.push("d.adv_degree_name LIKE @Programme");
        if (graduationYear) conditions.push("YEAR(d.adv_end_date) = @GraduationYear");
        if (sector) conditions.push("eh.aev_company = @Sector");

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

        const request = pool.request();
        if (programme) request.input("Programme", sql.VarChar, `%${programme}%`);
        if (graduationYear) request.input("GraduationYear", sql.Int, graduationYear);
        if (sector) request.input("Sector", sql.VarChar, sector);

        const query = `
            SELECT DISTINCT 
                u.aud_id AS UserID, 
                u.aud_email AS Email, 
                p.apd_full_name AS FullName, 
                p.apd_bio AS Bio,
                d.adv_degree_name AS Programme,
                YEAR(d.adv_end_date) AS GraduationYear,
                eh.aev_company AS Industry
            FROM AAP_USERS_DETAILS u
            LEFT JOIN AAP_PROFILES_DETAILS p ON u.aud_id = p.apd_user_id
            LEFT JOIN AAP_DEGREEDETAILS_VIEW d ON u.aud_id = d.adv_user_id
            LEFT JOIN AAP_EMPLOYMENTHISTORY_VIEW eh ON u.aud_id = eh.aev_user_id
            ${whereClause}
            ORDER BY FullName ASC
        `;

        const result = await request.query(query);
        return result.recordset;
    }
}

module.exports = AlumniModel;
