const CertificateModel = require("../models/certificateModel");

class CertificateController {
    static async getCertificates(req, res) {
        try {
            const certificates = await CertificateModel.getCertificates(req.user.id);
            res.json({ success: true, certificates });
        } catch (err) {
            console.error("Fetch certificate Error:", err);
            res.status(500).json({ success: false, message: "Error fetching certificate details" });
        }
    }

    static async updateCertificate(req, res) {
        const { certificationId, certificationName, issuingOrganization, issueDate } = req.body;
        if (!certificationName || !issuingOrganization) {
            return res.status(400).json({ success: false, message: "Certification Name and Issuing Organization are required" });
        }
        try {
            await CertificateModel.insertUpdateCertificate(certificationId, req.user.id, certificationName, issuingOrganization, issueDate);
            res.json({ success: true, message: "Certificate details saved successfully" });
        } catch (err) {
            const errorMessage = err.message || "";
            if (errorMessage.includes("MSG:")) {
                return res.json({ success: true, message: errorMessage.split("MSG:")[1].trim() });
            }
            console.error("Certificate Error:", err);
            res.status(500).json({ success: false, message: "An error occurred while saving certificate details." });
        }
    }

    static async deleteCertificate(req, res) {
        try {
            await CertificateModel.deleteCertificate(req.params.id, req.user.id);
            res.json({ success: true, message: "Certificate record deleted successfully" });
        } catch (err) {
            const errorMessage = err.message || "";
            if (errorMessage.includes("MSG:")) {
                return res.json({ success: true, message: errorMessage.split("MSG:")[1].trim() });
            }
            console.error("Delete Certificate Error:", err);
            res.status(500).json({ success: false, message: "An error occurred while deleting the record." });
        }
    }
}
module.exports = CertificateController;
