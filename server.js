require("dotenv").config();
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const db = require("./database/db");
const paymentRoutes = require("./routes/paymentRoutes");

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// Routes
const authRoutes = require("./routes/authRoutes");
const homeRoutes = require("./routes/homeRoutes");
const productRoutes = require("./routes/productRoutes");
const adminRoutes = require("./routes/admin");

// Use routes
app.use("/", authRoutes);
app.use("/", homeRoutes);
app.use("/", productRoutes);
app.use("/admin", adminRoutes);
app.use("/payment", paymentRoutes);

// Root redirect to /signin
app.get("/", (req, res) => res.redirect("/signin"));

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
