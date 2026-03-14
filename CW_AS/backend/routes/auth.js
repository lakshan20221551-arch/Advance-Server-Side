const express = require("express");
const router = express.Router();
const { sql, poolPromise } = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// --- REGISTER ROUTE ---
// This calls your "InsertUser" stored procedure
router.post("/register", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    try {
        const pool = await poolPromise;

        // 1. Hash the password before saving it to the DB
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 2. Execute the Stored Procedure "InsertUser"
        await pool.request()
            .input("Email", sql.VarChar(1000), email)
            .input("Password", sql.VarChar(4000), hashedPassword)
            .execute("dbo.InsertUser");

        res.status(201).json({ message: "User registered successfully" });

    } catch (err) {
        // Handle duplicate email errors if you have a unique constraint
        res.status(500).json({ error: err.message });
    }
});

// --- LOGIN ROUTE ---
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const pool = await poolPromise;

        // Querying the view as per your original code
        const result = await pool.request()
            .input("Email", sql.VarChar, email)
            .query("SELECT * FROM AAP_USERSDETAILS_VIEW WHERE auv_email = @Email");

        if (result.recordset.length === 0) {
            return res.status(401).json({ message: "Invalid Email" });
        }

        const user = result.recordset[0];

        // bcrypt.compare compares the plain text (password) with the hash in DB (user.aud_password)
        // Note: Ensure your View column name matches 'aud_password' or 'Password'
        const isMatch = await bcrypt.compare(password, user.auv_password || user.Password);

        if (!isMatch) {
            return res.status(401).json({ message: "Invalid Password" });
        }

        // Create JWT Token
        const token = jwt.sign(
            { id: user.auv_id || user.UserID, email: user.auv_email || user.Email },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.json({
            message: "Login Successful",
            token: token,
            user: {
                id: user.auv_id || user.UserID,
                email: user.auv_email || user.Email,
                name: user.auv_name || user.Name
            }
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;