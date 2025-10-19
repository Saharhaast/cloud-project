// models/Product.js (แก้ไขชื่อตัวแปร)
const pool = require("../database/db"); // เปลี่ยนชื่อตัวแปรจาก db เป็น pool

// ดึงรายละเอียดสินค้าตาม product_id
exports.getProductById = async (product_id) => {
    // ใช้ pool.query
    const [rows] = await pool.query("SELECT * FROM products WHERE product_id = ?", [product_id]);
    return rows[0];
};

// ดึงสินค้าที่แนะนำ
exports.getRecommendedProducts = async () => {
    // ใช้ pool.query
    const [rows] = await pool.query("SELECT * FROM products ORDER BY RAND() LIMIT 4");
    return rows;
};