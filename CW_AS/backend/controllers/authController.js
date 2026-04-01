const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const AuthModel = require("../models/authModel");

class AuthController {
    static async register(req, res) {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        try {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            await AuthModel.registerUser(email, hashedPassword);

            res.status(201).json({ message: "User registered successfully" });

        } catch (err) {
            const errorMessage = err.message || "";

            if (errorMessage.includes("MSG:")) {
                const cleanMessage = errorMessage.split("MSG:")[1].trim();
                return res.status(400).json({ success: false, message: cleanMessage });
            }

            console.error("System Error:", err);
            res.status(500).json({ success: false, error: "An unexpected error occurred. Please try again later." });
        }
    }

    static async login(req, res) {
        const { email, password } = req.body;

        try {
            const user = await AuthModel.getUserByEmail(email);

            if (!user) {
                await AuthModel.logLoginStat(email, req.ip || '', 'Failure: Invalid Email');
                return res.status(401).json({ message: "Invalid Email" });
            }

            const isMatch = await bcrypt.compare(password, user.auv_password || user.Password);

            if (!isMatch) {
                await AuthModel.logLoginStat(email, req.ip || '', 'Failure: Invalid Password');
                return res.status(401).json({ message: "Invalid Password" });
            }

            const token = jwt.sign(
                { id: user.auv_id || user.UserID, email: user.auv_email || user.Email },
                process.env.JWT_SECRET,
                { expiresIn: "1h" }
            );

            await AuthModel.logLoginStat(email, req.ip || '', 'Success');

            res.json({
                message: "Login Successful",
                token: token,
                user: {
                    id: user.auv_id || user.UserID,
                    email: user.auv_email || user.Email,
                    //name: user.auv_name || user.Name
                }
            });

        } catch (err) {
            const errorMessage = err.message || "";

            if (errorMessage.includes("MSG:")) {
                const cleanMessage = errorMessage.split("MSG:")[1].trim();
                return res.status(400).json({ success: false, message: cleanMessage });
            }

            console.error("System Error:", err);
            res.status(500).json({ success: false, error: "An unexpected error occurred. Please try again later." });
        }
    }

    static async forgetPassword(req, res) {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        try {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            await AuthModel.resetPassword(email, hashedPassword);

            res.status(201).json({ message: "Reset Password successfully" });

        } catch (err) {
            const errorMessage = err.message || "";

            if (errorMessage.includes("MSG:")) {
                const cleanMessage = errorMessage.split("MSG:")[1].trim();
                return res.status(400).json({ success: false, message: cleanMessage });
            }

            console.error("System Error:", err);
            res.status(500).json({ success: false, error: "An unexpected error occurred. Please try again later." });
        }
    }
}

module.exports = AuthController;
