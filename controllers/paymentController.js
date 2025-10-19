const paymentModel = require("../models/paymentModel");

exports.showPaymentPage = (req, res) => {
    // Try to get customer_id from req.user, fallback to req.query
    const customer_id = req.user?.customer_id || req.query.customer_id;
    if (!customer_id) return res.status(400).send("Missing customer_id");

    // ...your logic to get cart/payment info...
    res.render("payment", { customer_id });
};

// --- [แก้ไข] เปลี่ยนเป็น async/await ---
exports.clearCart = async (req, res) => {
    // ดึง customer_id จาก req.body (ถ้าเป็นการส่ง POST)
    const customer_id = req.body.customer_id;

    if (!customer_id) return res.status(400).json({ success: false, message: "Missing customer_id" });

    try {
        // Model ต้องถูกเปลี่ยนเป็น async และส่ง Promise กลับมา
        await paymentModel.clearCart(customer_id); 

        res.json({ success: true });
    } catch (err) {
        console.error("Error clearing cart:", err);
        // คืนค่า error ที่ถูกต้องหาก Model ส่ง error กลับมา
        res.status(500).json({ success: false, error: "Database error" });
    }
};