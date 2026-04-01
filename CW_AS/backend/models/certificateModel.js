const { sql, poolPromise } = require("../config/db");

class CertificateModel {
    static async getCertificates(userId) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input("UserID", sql.Int, userId)
            .query("SELECT acv_certification_id, acv_user_id, acv_certification_name, acv_issuing_organization, acv_issue_date FROM AAP_CERTIFICATEDETAILS_VIEW WHERE acv_user_id = @UserID");
        return result.recordset;
    }

    static async insertUpdateCertificate(certificationId, userId, certificationName, issuingOrganization, issueDate) {
        const pool = await poolPromise;
        await pool.request()
            .input("CertificationID", sql.Int, certificationId || 0)
            .input("UserID", sql.Int, userId)
            .input("CertificationName", sql.VarChar(1000), certificationName)
            .input("IssuingOrganization", sql.VarChar(1000), issuingOrganization)
            .input("IssueDate", sql.DateTime, issueDate || null)
            .execute("InsertUpdateCertificateDetails");
    }

    static async deleteCertificate(certificationId, userId) {
        const pool = await poolPromise;
        await pool.request()
            .input("CertificationID", sql.Int, certificationId)
            .input("UserID", sql.Int, userId)
            .execute("DeleteCertificateDetails");
    }
}
module.exports = CertificateModel;
