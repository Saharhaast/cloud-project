// เปลี่ยน db เป็น pool
const pool = require("../database/db");

const Product = {
    // ดึงสินค้าทั้งหมด (getAllAsync)
    getAllAsync: async () => {
        // ใช้ async/await แทน new Promise
        const sql = `
            SELECT product_id, name, description, image_url, price, color, gender, categories, category_id
            FROM Product
        `;
        
        // ใช้ pool.query เพื่อดึงข้อมูลหลายแถว (เหมือน db.all)
        const [rows] = await pool.query(sql);
        return rows;
    },

    // ดึงรายละเอียดสินค้าตาม product_id (getByIdAsync)
    getByIdAsync: async (product_id) => {
        // ใช้ async/await แทน new Promise
        const sql = `
            SELECT product_id, name, description, image_url, price, color, gender, categories, category_id
            FROM Product
            WHERE product_id = ?
        `;
        
        // ใช้ pool.query เพื่อดึงข้อมูลแถวเดียว (เหมือน db.get)
        const [rows] = await pool.query(sql, [product_id]);
        return rows[0]; // คืนค่าแถวแรก
    },

    // สร้างสินค้าใหม่ (create)
    create: async (data) => {
        // ใช้ async/await แทน new Promise
        const { name, description, image_url, price, color, gender, categories, category_id } = data;
        const sql = `
            INSERT INTO Product (name, description, image_url, price, color, gender, categories, category_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        // ใช้ pool.execute เพื่อทำ INSERT (เหมือน db.run)
        const [result] = await pool.execute(sql, [name, description, image_url, price, color, gender, categories, category_id]);
        
        // คืนค่า ID ที่ถูกสร้างขึ้น (MySQL ใช้ insertId)
        return result.insertId;
    },

    // อัปเดตสินค้า (update)
    update: async (data) => {
        // ใช้ async/await แทน new Promise
        const { product_id, name, description, image_url, price, color, gender, categories, category_id } = data;
        const sql = `
            UPDATE Product
            SET name=?, description=?, image_url=?, price=?, color=?, gender=?, categories=?, category_id=?
            WHERE product_id=?
        `;
        
        // ใช้ pool.execute เพื่อทำ UPDATE (เหมือน db.run)
        const [result] = await pool.execute(sql, [name, description, image_url, price, color, gender, categories, category_id, product_id]);
        
        // คืนค่าจำนวนแถวที่ถูกเปลี่ยนแปลง (MySQL ใช้ affectedRows)
        return result.affectedRows; 
    },

    // ลบสินค้า (delete)
    delete: async (product_id) => {
        // ใช้ async/await แทน new Promise
        const sql = `DELETE FROM Product WHERE product_id = ?`;
        
        // ใช้ pool.execute เพื่อทำ DELETE (เหมือน db.run)
        const [result] = await pool.execute(sql, [product_id]);
        
        // คืนค่าจำนวนแถวที่ถูกลบไป (MySQL ใช้ affectedRows)
        return result.affectedRows;
    }
};

module.exports = Product;