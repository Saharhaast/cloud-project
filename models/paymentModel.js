// เปลี่ยน db เป็น pool
const pool = require("../database/db"); 

// เปลี่ยนเป็นฟังก์ชัน async ที่ส่ง Promise กลับไป (ทำงานร่วมกับ await ใน Controller)
exports.clearCart = async (customer_id) => {
    const sql = "DELETE FROM Cart WHERE customer_id = ?";
    
    // ใช้ pool.execute เพื่อทำ DELETE (เหมือน db.run)
    // pool.execute จะคืน Promise และ Throw Error หากมีปัญหา
    const [result] = await pool.execute(sql, [customer_id]);
    
    // คืนค่าจำนวนแถวที่ถูกลบไป
    return result.affectedRows; 
};