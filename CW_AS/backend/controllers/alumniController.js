const AlumniModel = require("../models/alumniModel");

class AlumniController {
    static async getAlumniList(req, res) {
        try {
            const { programme, graduationYear, sector } = req.query;
            const alumni = await AlumniModel.getAllAlumni({ programme, graduationYear, sector });
            
            res.json({
                success: true,
                count: alumni.length,
                alumni
            });
        } catch (err) {
            console.error("Fetch Alumni List Error:", err);
            res.status(500).json({ success: false, message: "Error fetching alumni list" });
        }
    }
}

module.exports = AlumniController;
