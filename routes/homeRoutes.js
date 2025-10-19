const express = require("express");
const router = express.Router();
const homeController = require('../controllers/homeController');
const cartController = require("../controllers/cartController");
const paymentController = require("../controllers/paymentController"); // เพิ่ม
const { authenticate } = require("../middleware/authMiddleware");

// หน้า Home / Filter
router.get("/home", authenticate, homeController.showHome);
router.get("/filter-woman", authenticate, homeController.filterWoman);
router.get("/filter-man", authenticate, homeController.filterMan);
router.post("/filter-woman", authenticate, homeController.filterWoman);
router.post("/filter-man", authenticate, homeController.filterMan);

// หน้า Shopping Bag
router.get('/shopping-bag', authenticate, cartController.showCartPage); // เปลี่ยนจาก showCart เป็น showCartPage
router.post("/payment", authenticate, paymentController.showPaymentPage);


module.exports = router;