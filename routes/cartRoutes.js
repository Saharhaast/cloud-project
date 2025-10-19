const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');

// Shopping Bag Routes
router.get('/shopping-bag', cartController.showCartPage);
router.post('/add-to-cart', cartController.addToCart);
router.get('/get-cart', cartController.getCartItems);
router.post('/update-cart', cartController.updateCart);
router.post('/remove-item', cartController.removeCartItem);
router.post('/clear-cart', cartController.clearCart);

module.exports = router;
