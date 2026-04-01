const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    // Check both standard lowercase and Capital header
    const authHeader = req.headers.authorization || req.header("Authorization");
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized. Please login again." });
    }
    
    const token = authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Invalid token format." });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ message: "Invalid or expired token." });
    }
};

module.exports = authMiddleware;
