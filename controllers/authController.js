const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Customer = require("../models/customerModel");

// ดึงค่าโดยตรงจาก process.env (ซึ่ง EB จะตั้งให้)
const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS || "10");
const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_must_be_set_in_eb"; // *ตั้งค่า fallback ที่ปลอดภัยน้อยกว่าเพื่อให้โค้ดรันได้ แต่ควรตั้งค่าใน EB เสมอ*
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h";

// ----------------- Sign In -----------------
exports.showSignIn = (req, res) => res.render("signin", { error: null });

exports.signIn = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await Customer.findByEmail(email);

        if (!user) {
            return res.render("signin", { error: "Email หรือ รหัสผ่านไม่ถูกต้อง" });
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.render("signin", { error: "Email หรือ รหัสผ่านไม่ถูกต้อง" });
        }

        // สร้าง JWT พร้อม role
        const token = jwt.sign(
            { customer_id: user.customer_id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        res.cookie("token", token, { httpOnly: true, maxAge: 1000 * 60 * 60 });

        // ตรวจสอบ role
        if (user.role === "admin") {
            return res.redirect("/admin");
        } else {
            return res.redirect("/home");
        }
    } catch (err) {
        console.error(err);
        res.status(500).send("Database error.");
    }
};

// ----------------- Sign Up -----------------
exports.showSignUp = (req, res) => res.render("signup", { error: null });

exports.signUp = async (req, res) => {
    const { email, password } = req.body;

    try {
        const existingUser = await Customer.findByEmail(email);
        if (existingUser) {
            return res.render("signup", { error: "อีเมลนี้มีอยู่แล้ว" });
        }

        const hashed = await bcrypt.hash(password, SALT_ROUNDS);

        // สร้าง user ใหม่ พร้อม role = "user"
        await Customer.create(email, hashed, "user");

        res.redirect("/signin");
    } catch (err) {
        console.error(err);
        res.status(500).send("Server error.");
    }
};

// ----------------- Sign Out -----------------
exports.signOut = (req, res) => {
    res.clearCookie("token");
    res.redirect("/signin");
};
