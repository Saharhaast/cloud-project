const Product = require("../models/productModel");
const Cart = require("../models/cartModel");

// Detail Page
exports.detailPage = async (req, res) => {
    try {
        const { product_id } = req.query;
        if (!req.user) return res.status(401).send("Unauthorized");
        const customer_id = req.user.customer_id;

        const product = await Product.getByIdAsync(product_id);
        if (!product) return res.status(404).send("Product not found");

        const recommended = await Product.getAllAsync();
        res.render("detail", { 
            product, 
            recommendedProducts: recommended.slice(0, 4), 
            customer_id 
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server error");
    }
};

// Cart
exports.addToCart = async (req, res) => {
    try {
        if (!req.user) return res.status(401).send("Unauthorized");
        const { product_id, quantity } = req.body;
        const customer_id = req.user.customer_id;

        await Cart.addOrUpdateAsync(customer_id, product_id, quantity);
        res.send("Added to cart");
    } catch (err) {
        console.error(err);
        res.status(500).send("Database error");
    }
};

exports.getCart = async (req, res) => {
    try {
        if (!req.user) return res.status(401).send("Unauthorized");
        const customer_id = req.user.customer_id;

        const cartItems = await Cart.getByCustomerAsync(customer_id);
        res.json(cartItems);
    } catch (err) {
        console.error(err);
        res.status(500).send("Database error");
    }
};

exports.updateCart = async (req, res) => {
    try {
        if (!req.user) return res.status(401).send("Unauthorized");
        const { product_id, quantity } = req.body;
        const customer_id = req.user.customer_id;

        await Cart.updateQuantityAsync(customer_id, product_id, quantity);
        res.send("Cart updated");
    } catch (err) {
        console.error(err);
        res.status(500).send("Database error");
    }
};

exports.removeCartItem = async (req, res) => {
    try {
        if (!req.user) return res.status(401).send("Unauthorized");
        const { product_id } = req.body;
        const customer_id = req.user.customer_id;

        await Cart.removeAsync(customer_id, product_id);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false });
    }
};

exports.clearCart = async (req, res) => {
    try {
        if (!req.user) return res.status(401).send("Unauthorized");
        const customer_id = req.user.customer_id;

        await Cart.clearAsync(customer_id);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false });
    }
};
