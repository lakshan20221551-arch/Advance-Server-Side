const express = require("express");
const router = express.Router();
const { sql, poolPromise } = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

router.post("/login", async (req, res) => {

    const { email, password } = req.body;

    try {

        const pool = await poolPromise;

        const result = await pool.request()
            .input("Email", sql.VarChar, email)
            .query("SELECT * FROM Users WHERE Email = @Email");

        if (result.recordset.length === 0) {
            return res.status(401).json({ message: "Invalid Email" });
        }

        const user = result.recordset[0];

        const isMatch = await bcrypt.compare(password, user.Password);

        if (!isMatch) {
            return res.status(401).json({ message: "Invalid Password" });
        }

        const token = jwt.sign(
            { id: user.UserID, email: user.Email },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.json({
            message: "Login Successful",
            token: token,
            user: {
                id: user.UserID,
                name: user.Name,
                email: user.Email
            }
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }

});

module.exports = router;