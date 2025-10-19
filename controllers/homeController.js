// เปลี่ยน db เป็น pool
const pool = require("../database/db"); 

// --- [แก้ไข] เปลี่ยนเป็น async/await และ pool.query ---
// หน้า Home
exports.showHome = async (req, res) => {
    try {
        const customer_id = req.user.customer_id;

        // Query 1: สินค้าผู้หญิง
        const sqlWomen = "SELECT * FROM Product WHERE gender = 1 LIMIT 4";
        const [products] = await pool.query(sqlWomen); // ใช้ pool.query และดึง rows ออกมา

        // Query 2: สินค้าผู้ชาย (Studio Products)
        // Note: Query ที่ซับซ้อนแบบนี้ MySQL รองรับได้ แต่ควรสร้าง Index ให้ Category.name
        const sqlMen = `
            SELECT p.* FROM Product p
            JOIN Category c ON p.category_id = c.category_id
            WHERE p.gender = 2 AND c.name = 'Jeans'
            LIMIT 4`;
        
        // ถ้าคุณยังใช้ Subquery เดิม (SELECT * FROM Product WHERE gender = 2 AND category_id = (SELECT category_id FROM Category WHERE name = 'Jeans') LIMIT 4)
        // คุณยังสามารถใช้ pool.query ได้เลย
        const [studioProducts] = await pool.query(sqlMen); 

        res.render("home", { products, studioProducts, customer_id });
    } catch (err) {
        console.error("Error fetching home data:", err);
        res.status(500).send("Database error.");
    }
};

// --- [แก้ไข] เปลี่ยนเป็น async/await และ pool.query ---
// ฟังก์ชัน filter สินค้า
exports.filterProducts = async (gender, req, res, view) => {
    try {
        const customer_id = req.user.customer_id;

        // เปลี่ยนจาก req.query เป็น req.body เพราะเราจะใช้ method POST
        let { category, color, price } = req.body;

        let sql = "SELECT * FROM Product WHERE 1=1";
        let params = [];

        if (gender !== null) {
            sql += " AND gender = ?";
            params.push(gender);
        }
        if (category) {
            sql += " AND category_id = ?";
            params.push(category);
        }
        if (color) {
            sql += " AND color = ?";
            params.push(color);
        }
        if (price === "1") {
            sql += " AND price BETWEEN ? AND ?";
            params.push(0, 1000);
        }
        if (price === "2") {
            sql += " AND price BETWEEN ? AND ?";
            params.push(1000, 5000);
        }
        if (price === "3") {
            sql += " AND price BETWEEN ? AND ?";
            params.push(5000, 10000);
        }

        // ใช้ pool.query เพื่อดึงข้อมูลทั้งหมด (เหมือน db.all)
        const [rows] = await pool.query(sql, params); 
        
        res.render(view, { products: rows, customer_id });
    } catch (err) {
        console.error("Error filtering products:", err.message);
        res.status(500).send("Database error.");
    }
};

// ฟิลเตอร์ผู้หญิง (ไม่มีการเปลี่ยนแปลง)
exports.filterWoman = (req, res) => {
    exports.filterProducts(1, req, res, "filter-woman");
};

// ฟิลเตอร์ผู้ชาย (ไม่มีการเปลี่ยนแปลง)
exports.filterMan = (req, res) => {
    exports.filterProducts(2, req, res, "filter-man");
};