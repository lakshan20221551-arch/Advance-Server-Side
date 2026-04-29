const requireRole = (role) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized. User not found." });
        }
        if (req.user.role !== role) {
            return res.status(403).json({ message: "Forbidden. Insufficient permissions." });
        }
        next();
    };
};

module.exports = requireRole;
