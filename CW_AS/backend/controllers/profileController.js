const ProfileModel = require("../models/profileModel");

class ProfileController {
    static async getProfile(req, res) {
        try {
            const profile = await ProfileModel.getProfileByUserId(req.user.id);
            if (profile) {
                let imageBase64 = null;
                if (profile.apd_profile_image) {
                    imageBase64 = `data:image/jpeg;base64,${profile.apd_profile_image.toString('base64')}`;
                }
                res.json({
                    success: true,
                    profile: {
                        fullName: profile.apd_full_name || "",
                        bio: profile.apd_bio || "",
                        linkedInUrl: profile.apd_linkedIn_url || "",
                        profileImageBase64: imageBase64
                    }
                });
            } else {
                res.json({ success: true, profile: null });
            }
        } catch (err) {
            console.error("Fetch Profile Error:", err);
            res.status(500).json({ success: false, message: "Error fetching profile" });
        }
    }

    static async updateProfile(req, res) {
        const { apd_full_name, apd_bio, apd_linkedIn_url } = req.body;
        const profileImageBuffer = req.file ? req.file.buffer : null;

        try {
            await ProfileModel.insertUpdateProfile(req.user.id, apd_full_name, apd_bio, apd_linkedIn_url, profileImageBuffer);
            res.status(200).json({ success: true, message: "Profile saved successfully." });
        } catch (err) {
            const errorMessage = err.message || "";
            if (errorMessage.includes("MSG:")) {
                return res.status(400).json({ success: false, message: errorMessage.split("MSG:")[1].trim() });
            }
            console.error("Profile Error:", err);
            res.status(500).json({ success: false, message: "An unexpected error occurred." });
        }
    }
}
module.exports = ProfileController;
