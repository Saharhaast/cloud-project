const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const authMiddleware = require("../middleware/authMiddleware");

// Detail page
router.get("/detail", authMiddleware.authenticate, productController.detailPage);

// Cart
router.post("/add-to-cart", authMiddleware.authenticate, productController.addToCart);
router.get("/get-cart", authMiddleware.authenticate, productController.getCart);
router.post("/update-cart", authMiddleware.authenticate, productController.updateCart);
router.post("/remove-item", authMiddleware.authenticate, productController.removeCartItem);
router.post("/clear-cart", authMiddleware.authenticate, productController.clearCart);

module.exports = router;
