const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// หน้า Sign In
router.get("/signin", authController.showSignIn);
router.post("/signin", authController.signIn);

// หน้า Sign Up
router.get("/signup", authController.showSignUp);
router.post("/signup", authController.signUp);

// Sign Out
router.get("/signout", authController.signOut);

module.exports = router;
