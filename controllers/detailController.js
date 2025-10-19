// ใน productModel.js
const pool = require('../database/db'); // ต้องถูกเปลี่ยนเป็น pool object ของ MySQL แล้ว

exports.getProductById = async (productId) => {
    // ใช้ pool.query เพื่อดึงข้อมูลแถวเดียว
    const sql = "SELECT * FROM Product WHERE product_id = ?";
    
    // pool.query จะคืนค่าเป็น [rows, fields]
    const [rows] = await pool.query(sql, [productId]); 

    // คืนค่าเป็นแถวแรก (ข้อมูลสินค้า)
    return rows[0]; 
};

// ... ฟังก์ชันอื่น ๆ ที่เกี่ยวข้องกับสินค้า (เช่น getAllProducts, search, ฯลฯ) ก็ต้องถูกแก้ไขด้วย ...