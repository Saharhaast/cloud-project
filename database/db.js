const mysql = require('mysql2/promise'); // ใช้ mysql2/promise เพื่อรองรับ async/await
const path = require("path"); // ยังคงใช้ได้ถ้าต้องการ path สำหรับส่วนอื่น

// ใช้ Environment Variables จาก AWS Elastic Beanstalk
const connectionParams = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// สร้าง Connection Pool
const pool = mysql.createPool(connectionParams);

// ทดสอบการเชื่อมต่อ
pool.getConnection()
    .then(connection => {
        console.log("✅ Connected to Amazon RDS (MySQL) database.");
        connection.release();
    })
    .catch(err => {
        console.error("❌ Error connecting to RDS:", err.message);
        // การเชื่อมต่อล้มเหลวที่นี่จะทำให้ Server Crash
        // ต้องมั่นใจว่า Environment Variables ถูกต้อง
        process.exit(1); 
    });


module.exports = pool; // Export pool แทน db