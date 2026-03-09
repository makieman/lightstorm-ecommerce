const jwt = require("jsonwebtoken");
const UserModel = require("../Models/user.model");
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error("JWT_SECRET env var is required");

/**
 * Admin authentication middleware.
 * Verifies JWT from httpOnly cookie and checks isAdmin flag.
 */
const adminMiddleware = async (req, res, next) => {
    try {
        const cookie = req.cookies["jwt"];
        if (!cookie) {
            return res.status(401).json({ message: "Unauthorized: No token provided" });
        }

        const claims = jwt.verify(cookie, JWT_SECRET);
        if (!claims || !claims._id) {
            return res.status(401).json({ message: "Unauthorized: Invalid token" });
        }

        const user = await UserModel.findById(claims._id);
        if (!user) {
            return res.status(401).json({ message: "Unauthorized: User not found" });
        }

        const { isTokenInvalidatedByPasswordChange } = require('../Utils/auth.utils');
        if (isTokenInvalidatedByPasswordChange(claims, user)) {
            return res.status(401).json({ message: 'Unauthorized: Token invalidated due to password change.' });
        }

        if (!user.isAdmin) {
            return res.status(403).json({ message: "Forbidden: Admin access required" });
        }

        // Attach user to request for downstream use
        req.adminUser = user;
        next();
    } catch (error) {
        if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Unauthorized: Invalid or expired token" });
        }
        return res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = adminMiddleware;
