// เปลี่ยน db เป็น pool
const pool = require("../database/db");

const Customer = {
    // สร้างลูกค้าใหม่
    create: async (email, password) => {
        // ใช้ async/await แทน new Promise
        const sql = "INSERT INTO Customer (email, password, role) VALUES (?, ?, 'customer')";
        
        // ใช้ pool.execute เพื่อทำ INSERT (เหมือน db.run)
        const [result] = await pool.execute(sql, [email, password]);
        
        // คืนค่า ID ที่ถูกสร้างขึ้น (MySQL ใช้ insertId)
        return result.insertId;
    },

    // หา customer ด้วย email
    findByEmail: async (email) => {
        // ใช้ async/await แทน new Promise
        const sql = "SELECT * FROM Customer WHERE email = ?";
        
        // ใช้ pool.query เพื่อดึงข้อมูล (เหมือน db.get)
        const [rows] = await pool.query(sql, [email]);
        
        // คืนค่าแถวแรก (ข้อมูลลูกค้า)
        return rows[0]; 
    },

    // หา customer ด้วย customer_id
    findById: async (customer_id) => {
        // ใช้ async/await แทน new Promise
        const sql = "SELECT * FROM Customer WHERE customer_id = ?";
        
        // ใช้ pool.query เพื่อดึงข้อมูล (เหมือน db.get)
        const [rows] = await pool.query(sql, [customer_id]);
        
        // คืนค่าแถวแรก (ข้อมูลลูกค้า)
        return rows[0]; 
    }
};

module.exports = Customer;