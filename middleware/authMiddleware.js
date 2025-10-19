const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_must_be_set_in_eb";

// ตรวจสอบว่าผู้ใช้ล็อกอินหรือไม่
exports.authenticate = (req, res, next) => {
    const token =
        req.cookies?.token ||
        (req.headers.authorization?.startsWith("Bearer ")
            ? req.headers.authorization.split(" ")[1]
            : null);

    if (!token) return res.redirect("/signin");

    try {
        req.user = jwt.verify(token, JWT_SECRET);
        next();
    } catch (err) {
        console.error("JWT verify error:", err.message);
        return res.redirect("/signin");
    }
};

// ตรวจสอบว่าเป็น admin หรือไม่
exports.requireAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== "admin") {
        return res.status(403).send("Access denied. Admins only.");
    }
    next();
};
