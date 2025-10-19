// เปลี่ยน db เป็น pool
const pool = require("../database/db");

const Cart = {
    // ดึงรายการตะกร้าของลูกค้า
    getByCustomerAsync: async (customer_id) => {
        // ไม่ต้องใช้ new Promise แล้ว เพราะ pool.query/execute คืน Promise อยู่แล้ว
        const sql = `
            SELECT p.product_id, p.name, p.price, p.image_url, c.quantity
            FROM Cart c
            INNER JOIN Product p ON c.product_id = p.product_id
            WHERE c.customer_id = ?
        `;
        
        // ใช้ pool.query เพื่อดึงข้อมูลหลายแถว (เหมือน db.all)
        // pool.query คืนค่าเป็น [rows, fields] เราดึง rows ออกมา
        const [rows] = await pool.query(sql, [customer_id]);
        return rows;
    },

    // เพิ่มหรืออัปเดตสินค้าในตะกร้า
    addOrUpdateAsync: async (customer_id, product_id, quantity) => {
        // ใช้ pool.query เพื่อค้นหาข้อมูลแถวเดียว (เหมือน db.get)
        const [rows] = await pool.query(
            "SELECT quantity FROM Cart WHERE customer_id=? AND product_id=?",
            [customer_id, product_id]
        );
        const row = rows[0]; // ดึงแถวแรก

        if (row) {
            // หากมีสินค้าเดิมอยู่: อัปเดต (UPDATE)
            const newQuantity = row.quantity + quantity;
            const updateSql = "UPDATE Cart SET quantity=? WHERE customer_id=? AND product_id=?";
            
            // ใช้ pool.execute เพื่อทำ UPDATE (เหมือน db.run)
            const [result] = await pool.execute(updateSql, [newQuantity, customer_id, product_id]);
            return result.affectedRows; // MySQL ใช้ affectedRows แทน this.changes
        } else {
            // หากไม่มีสินค้าเดิม: เพิ่ม (INSERT)
            const insertSql = "INSERT INTO Cart (customer_id, product_id, quantity) VALUES (?, ?, ?)";
            
            // ใช้ pool.execute เพื่อทำ INSERT
            const [result] = await pool.execute(insertSql, [customer_id, product_id, quantity]);
            return result.insertId; // MySQL ใช้ insertId แทน this.lastID
        }
    },

    // อัปเดตจำนวนสินค้า
    updateQuantityAsync: async (customer_id, product_id, quantity) => {
        const sql = "UPDATE Cart SET quantity=? WHERE customer_id=? AND product_id=?";
        
        // ใช้ pool.execute เพื่อทำ UPDATE 
        const [result] = await pool.execute(sql, [quantity, customer_id, product_id]);
        return result.affectedRows;
    },

    // ลบสินค้าออกจากตะกร้า
    removeAsync: async (customer_id, product_id) => {
        const sql = "DELETE FROM Cart WHERE customer_id=? AND product_id=?";
        
        // ใช้ pool.execute เพื่อทำ DELETE 
        const [result] = await pool.execute(sql, [customer_id, product_id]);
        return result.affectedRows;
    },

    // ล้างตะกร้าทั้งหมด
    clearAsync: async (customer_id) => {
        const sql = "DELETE FROM Cart WHERE customer_id=?";
        
        // ใช้ pool.execute เพื่อทำ DELETE 
        const [result] = await pool.execute(sql, [customer_id]);
        return result.affectedRows;
    }
};

module.exports = Cart;