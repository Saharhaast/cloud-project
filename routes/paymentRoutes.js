const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");
const { authenticate } = require("../middleware/authMiddleware");


// แสดงหน้า payment
router.get("/",authenticate, paymentController.showPaymentPage);

// ลบตะกร้าเมื่อกด ORDER
router.post("/clear-cart",authenticate,  paymentController.clearCart);

module.exports = router;