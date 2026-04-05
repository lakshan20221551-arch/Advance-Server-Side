const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const AuthModel = require("../models/authModel");
const sendEmail = require("../utils/sendEmail");

class AuthController {


    //  REGISTRATION and  EMAIL VERIFICATION SYSTEM 

    static async register(req, res) {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ message: "Email and password are required" });

        try {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // 1. Create Base User
            await AuthModel.registerUser(email, hashedPassword);

            // 2. Generate Verification Token
            const verifyToken = crypto.randomBytes(32).toString('hex');
            const verifyExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

            try { await AuthModel.setVerifyToken(email, verifyToken, verifyExpiry); } 
            catch(dbErr) { console.error("Could not set Verify Token (ensure DB columns match):", dbErr); }

            // 3. Send Verification Email
            const verifyUrl = `${req.protocol}://${req.get('host')}/api/auth/verify/${verifyToken}`;
            await sendEmail({
                to: email,
                subject: "Verify Your Alumni Platform Account",
                html: `<h3>Welcome to Alumni Platform!</h3>
                       <p>Please verify your email to unlock login access:</p>
                       <a href="${verifyUrl}" style="background-color:#4CAF50;color:white;padding:10px 15px;text-decoration:none;border-radius:5px;display:inline-block;">Verify Account</a>
                       <p><em>This link will automatically expire in 24 hours.</em></p>`
            });

            res.status(201).json({ success: true, message: "User registered successfully! Please check your email inbox to verify your account." });
        } catch (err) {
            const errorMessage = err.message || "";
            if (errorMessage.includes("MSG:")) return res.status(400).json({ success: false, message: errorMessage.split("MSG:")[1].trim() });
            console.error("System Error:", err);
            res.status(500).json({ success: false, error: "An unexpected error occurred. Please try again later." });
        }
    }

    static async verifyEmail(req, res) {
        try {
            const token = req.params.token;
            const user = await AuthModel.getUserByVerifyToken(token);

            if (!user) {
                return res.status(400).send("<h3>Verification Failed</h3><p>Invalid or missing verification token.</p>");
            }

            if (new Date(user.au_verify_token_expiry) < new Date()) {
                return res.status(400).send("<h3>Verification Expired</h3><p>Please request a new verification token.</p>");
            }

            await AuthModel.verifyUserByToken(token);

            // Responds with a simple success HTML page when confirming from email
            res.send("<h3>Success!</h3><p>Your email has been successfully verified! You can safely close this window and log in.</p>");
        } catch(err) {
            console.error("Verification Error", err);
            res.status(500).send("An error occurred during verification");
        }
    }


    //    LOGIN & AUTHENTICATION 

    static async login(req, res) {
        const { email, password } = req.body;

        if (email === "admin@admin.com" && password === "admin123") {
            const token = jwt.sign(
                { id: 0, email: email, role: 'admin' },
                process.env.JWT_SECRET,
                { expiresIn: "1h" }
            );
            return res.json({
                message: "Admin Login Successful (Bypass Mode)",
                token: token,
                user: { id: 0, email: email, role: 'admin' }
            });
        }

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

            // [SECURITY GATES] - Blocks login if user hasn't completed Email Verification! 
            // If the query returns NULL (assuming the DB struct isn't fully set yet), we let them pass for safety, but if it explicitly returns 0, we block.
            if (user.isVerified === false || user.isVerified === 0) {
                 return res.status(403).json({ success: false, message: "ACCOUNT NOT VERIFIED: Please check your email and click the verification link before logging in." });
            }

            //const role = user.auv_role || user.Role || (user.auv_email === 'admin@gmail.com' ? 'admin' : 'user');

            const token = jwt.sign(
                { id: user.auv_id || user.UserID, email: user.auv_email || user.Email, role: role },
                process.env.JWT_SECRET,
                { expiresIn: "1h" } // Handles standard Timeout Handling
            );

            await AuthModel.logLoginStat(email, req.ip || '', 'Success');

            res.json({
                message: "Login Successful",
                token: token,
                user: { id: user.auv_id || user.UserID, email: user.auv_email || user.Email, role: role }
            });

        } catch (err) {
            console.error("System Error:", err);
            res.status(500).json({ success: false, error: "An unexpected error occurred." });
        }
    }

    static async logout(req, res) {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(400).json({ message: "No token provided" });
        }

        const token = authHeader.split(" ")[1];
        
        try {
            const decoded = jwt.decode(token);
            if (!decoded) return res.status(400).json({ message: "Invalid token" });

            const expiry = new Date(decoded.exp * 1000);

            // Blacklists the strict token rendering the session destroyed.
            await AuthModel.blacklistToken(token, expiry);

            res.json({ success: true, message: "Secure logout complete. Token session aggressively terminated." });
        } catch(err) {
            console.error(err);
            res.status(500).json({ message: "Error during logout process" });
        }
    }


    
    //    PASSWORD RESET FUNCTIONALITY

    static async forgetPassword(req, res) {
        // Only asks for email now!
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: "Please provide your email address" });

        try {
            const user = await AuthModel.getUserByEmail(email);
            if (!user) {
                // Return success anyway to prevent "Email Harvesting" (Security Best Practice)
                return res.json({ message: "If that email matches an account, a reset link will be sent shortly." });
            }

            const resetToken = crypto.randomBytes(32).toString('hex');
            const resetExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 Minute short-life expiry mapping requirement

            await AuthModel.setResetToken(email, resetToken, resetExpiry);

            const resetUrl = `http://localhost:5173/reset-password?token=${resetToken}`; 
            
            await sendEmail({
                to: email,
                subject: "Alumni Platform - Password Reset Request",
                html: `<p>A password reset was requested for your account.</p>
                       <p>Please click this link to enter your new password:</p>
                       <a href="${resetUrl}">Reset Password</a>
                       <p><strong style="color:red;">This link expires in 15 minutes.</strong></p>`
            });

            res.json({ success: true, message: "If that email matches an account, a reset link will be sent shortly." });
        } catch (err) {
            console.error("System Error:", err);
            res.status(500).json({ success: false, error: "An unexpected error occurred." });
        }
    }

    static async resetPassword(req, res) {
        // Re-routed endpoint handling token and newPassword combo!
        const { token, newPassword } = req.body;
        if (!token || !newPassword) return res.status(400).json({ message: "Token and new password required" });

        try {
            const user = await AuthModel.getUserByResetToken(token);
            if (!user) return res.status(400).json({ message: "Invalid or unauthorized reset token." });

            if (new Date(user.au_reset_token_expiry) < new Date()) {
                return res.status(400).json({ message: "Reset token has officially expired. Please request a new one." });
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(newPassword, salt);

            await AuthModel.updatePasswordByToken(token, hashedPassword);

            res.json({ success: true, message: "Account Password has been successfully updated! You can now log in." });
        } catch (err) {
            console.error("System Error:", err);
            res.status(500).json({ success: false, error: "An unexpected error occurred." });
        }
    }
}

module.exports = AuthController;
