const express = require("express");
const router = express.Router();
const { sql, poolPromise } = require("../config/db");
const jwt = require("jsonwebtoken");
const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized. Please login again." });
    }
    const token = authHeader.split(" ")[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ message: "Invalid or expired token." });
    }
};

// --- GET ROUTE: Load profile data into frontend ---
router.get("/profile", authMiddleware, async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input("UserID", sql.Int, req.user.id)
            .query("SELECT * FROM AAP_PROFILES_DETAILS WHERE apd_user_id = @UserID");

        if (result.recordset.length > 0) {
            const profile = result.recordset[0];

            // Send back base64 image string so the frontend displays the actual image
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
});

// --- POST/UPDATE ROUTE (Bypassing Procedural Identity Error) ---
router.post("/profile", authMiddleware, upload.single("apd_profile_image"), async (req, res) => {
    const { apd_full_name, apd_bio, apd_linkedIn_url } = req.body;
    const userId = req.user.id;
    
    // Retrieve the file buffer
    const profileImageBuffer = req.file ? req.file.buffer : null;

    try {
        const pool = await poolPromise;

        // Automatically resolve ProfileID so the stored procedure's UPDATE conditional triggers correctly
        let profileId = 0;
        const idCheck = await pool.request()
            .input("UID", sql.Int, userId)
            .query("SELECT apd_profile_id FROM AAP_PROFILES_DETAILS WHERE apd_user_id = @UID");
        
        if (idCheck.recordset.length > 0) {
            profileId = idCheck.recordset[0].apd_profile_id;
        }

        await pool.request()
            .input("UserID", sql.Int, userId)
            // .input("ProfileID", sql.Int, profileId)
            .input("FullName", sql.VarChar(4000), apd_full_name || null)
            .input("Bio", sql.VarChar(4000), apd_bio || null)
            .input("LinkinURL", sql.VarChar(sql.MAX), apd_linkedIn_url || null)
            .input("ProfileImage", sql.Image, profileImageBuffer) // sql.Image bypasses RPC length bug
            .execute("InsertUpdateProfileDetails");

        res.status(200).json({ success: true, message: "Profile saved successfully." });
    } catch (err) {
        // Handle common custom error messages
        const errorMessage = err.message || "";
        if (errorMessage.includes("MSG:")) {
            const cleanMessage = errorMessage.split("MSG:")[1].trim();
            return res.status(400).json({ success: false, message: cleanMessage });
        }

        console.error("Profile Error:", err);
        res.status(500).json({ success: false, message: "An unexpected error occurred." });
    }
});

module.exports = router;