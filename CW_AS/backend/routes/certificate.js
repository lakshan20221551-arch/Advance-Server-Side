const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const CertificateController = require("../controllers/certificateController");

router.get("/", authMiddleware, CertificateController.getCertificates);
router.post("/certificate-update", authMiddleware, CertificateController.updateCertificate);
router.delete("/delete-certificate/:id", authMiddleware, CertificateController.deleteCertificate);

module.exports = router;
