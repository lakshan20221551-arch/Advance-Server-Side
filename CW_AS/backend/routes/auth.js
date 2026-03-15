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

       
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        
        await pool.request()
            .input("Email", sql.VarChar(1000), email)
            .input("Password", sql.VarChar(4000), hashedPassword)
            .execute("dbo.InsertUser");

        res.status(201).json({ message: "User registered successfully" });

} 
catch (err) {
    const errorMessage = err.message || "";

    // Check if the error is one of our custom RAISERROR messages
    if (errorMessage.includes("MSG:")) {
        // Strip the "MSG:" prefix to keep the UI clean
        const cleanMessage = errorMessage.split("MSG:")[1].trim();
        
        return res.status(400).json({ 
            success: false,
            message: cleanMessage 
        });
    }

    // Fallback for real system/server errors
    console.error("System Error:", err);
    res.status(500).json({ 
        success: false, 
        error: "An unexpected error occurred. Please try again later." 
    });
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

        
        const isMatch = await bcrypt.compare(password, user.auv_password || user.Password);

        if (!isMatch) {
            return res.status(401).json({ message: "Invalid Password" });
        }

        
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

    }catch (err) {
    const errorMessage = err.message || "";

    if (errorMessage.includes("MSG:")) {
        const cleanMessage = errorMessage.split("MSG:")[1].trim();
        
        return res.status(400).json({ 
            success: false,
            message: cleanMessage 
        });
    }

    console.error("System Error:", err);
    res.status(500).json({ 
        success: false, 
        error: "An unexpected error occurred. Please try again later." 
    });
}
});

router.post("/forget-password", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    try {
        const pool = await poolPromise;

       
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        
        await pool.request()
            .input("Email", sql.VarChar(1000), email)
            .input("Password", sql.VarChar(4000), hashedPassword)
            .execute("dbo.ResetPassword");

        res.status(201).json({ message: "Reset Password successfully" });

} 
catch (err) {
    const errorMessage = err.message || "";

    // Check if the error is one of our custom RAISERROR messages
    if (errorMessage.includes("MSG:")) {
        // Strip the "MSG:" prefix to keep the UI clean
        const cleanMessage = errorMessage.split("MSG:")[1].trim();
        
        return res.status(400).json({ 
            success: false,
            message: cleanMessage 
        });
    }

    // Fallback for real system/server errors
    console.error("System Error:", err);
    res.status(500).json({ 
        success: false, 
        error: "An unexpected error occurred. Please try again later." 
    });
}
});

module.exports = router;