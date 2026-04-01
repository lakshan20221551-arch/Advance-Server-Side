

const PublicApiModel = require("../models/publicApiModel");

class PublicApiController {
    static async getFeaturedAlumnus(req, res) {
        try {
            const alumnus = await PublicApiModel.getFeaturedAlumnus();
            if (alumnus) {
                res.json({ message: "Featured alumnus retrieved successfully", alumnus });
            } else {
                res.status(404).json({ message: "No featured alumnus found." });
            }
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Server error" });
        }
    }
}

module.exports = PublicApiController;