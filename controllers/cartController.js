const Cart = require("../models/cartModel");
const Product = require("../models/productModel");
const async = require("async");


// แสดงหน้าตะกร้า
exports.showCartPage = async (req, res) => {
    const customer_id = req.user?.customer_id || req.query.customer_id;
    if (!customer_id) return res.status(401).send("Please sign in first.");

    try {
        const cartItems = await Cart.getByCustomerAsync(customer_id);
        res.render("shopping-bag", { customer_id, cartItems });
    } catch (err) {
        console.error(err);
        res.status(500).send("Database error.");
    }
};

// เพิ่มสินค้าในตะกร้า
exports.addToCart = async (req, res) => {
    const { product_id, quantity } = req.body;
    const customer_id = req.user?.customer_id || req.body.customer_id;
    if (!customer_id || !product_id || !quantity) return res.status(400).send("Invalid request data.");

    try {
        await Cart.addOrUpdateAsync(customer_id, product_id, quantity);
        res.send("Added to cart");
    } catch (err) {
        console.error(err);
        res.status(500).send("Database error");
    }
};

// ดึงข้อมูลตะกร้า (JSON)
exports.getCartItems = async (req, res) => {
    const customer_id = req.user?.customer_id || req.query.customer_id;
    if (!customer_id) return res.status(401).send("Please sign in first.");

    try {
        const cartItems = await Cart.getByCustomerAsync(customer_id);
        res.json(cartItems);
    } catch (err) {
        console.error(err);
        res.status(500).send("Database error");
    }
};

// อัพเดตจำนวนสินค้า
exports.updateCart = async (req, res) => {
    const { product_id, quantity } = req.body;
    const customer_id = req.user?.customer_id || req.body.customer_id;
    if (!customer_id || !product_id || !quantity) return res.status(400).send("Invalid request data.");

    try {
        await Cart.updateQuantityAsync(customer_id, product_id, quantity);
        res.send("Cart updated");
    } catch (err) {
        console.error(err);
        res.status(500).send("Database error");
    }
};

// ลบสินค้าออกจากตะกร้า
exports.removeCartItem = async (req, res) => {
    const { product_id } = req.body;
    const customer_id = req.user?.customer_id || req.body.customer_id;
    if (!customer_id || !product_id) return res.status(400).send("Missing parameters.");

    try {
        await Cart.removeAsync(customer_id, product_id);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false });
    }
};

// ล้างตะกร้าทั้งหมด
exports.clearCart = async (req, res) => {
    const customer_id = req.user?.customer_id || req.body.customer_id;
    if (!customer_id) return res.status(400).json({ success: false, message: "Missing customer_id" });

    try {
        await Cart.clearAsync(customer_id);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false });
    }
};
