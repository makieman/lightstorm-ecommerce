const jwt = require("jsonwebtoken");
const UserModel = require("../Models/user.model");
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error("JWT_SECRET env var is required");

/**
 * User authentication middleware.
 * Verifies JWT from httpOnly cookie and attaches the user to req.user.
 * Does NOT require admin role — any authenticated user passes.
 */
const requireAuth = async (req, res, next) => {
  try {
    const cookie = req.cookies["jwt"];
    if (!cookie) {
      return res
        .status(401)
        .json({ message: "Unauthorized: Please log in to continue." });
    }

    const claims = jwt.verify(cookie, JWT_SECRET);
    if (!claims || !claims._id) {
      return res.status(401).json({ message: "Unauthorized: Invalid token." });
    }

    const user = await UserModel.findById(claims._id);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized: User not found." });
    }

    // Attach authenticated user to the request for downstream use
    req.user = user;
    next();
  } catch (error) {
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return res
        .status(401)
        .json({ message: "Unauthorized: Invalid or expired token." });
    }
    return res.status(500).json({ message: "Internal server error." });
  }
};

module.exports = requireAuth;
