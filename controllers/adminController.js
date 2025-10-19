// เปลี่ยนชื่อตัวแปรจาก db เป็น pool (ถ้าไฟล์ db.js ถูกแก้ให้ export pool แล้ว)
const pool = require("../database/db"); 
const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
    // Note: sessionToken is typically not needed for standard IAM roles/users
    // You might remove it if you set up IAM roles correctly on EB instance
    sessionToken: process.env.AWS_SESSION_TOKEN
});

// Helper function to get S3 Key from URL (ไม่มีการเปลี่ยนแปลง)
const getKeyFromUrl = (url) => {
    try {
        const urlObject = new URL(url);
        return urlObject.pathname.substring(1);
    } catch (e) {
        console.error("Invalid URL:", url);
        return null;
    }
}

exports.showAdminPage = (req, res) => {
    res.render("admin", { user: req.user });
};

// --- [แก้ไข] เปลี่ยนเป็น async/await และ pool.query ---
exports.getProducts = async (req, res) => {
    try {
        const genderFilter = req.query.gender;
        let sql = "SELECT * FROM Product";
        const params = [];
        
        if (genderFilter) {
            sql += " WHERE gender = ?";
            params.push(genderFilter);
        }

        // ใช้ pool.query เพื่อดึงข้อมูลทั้งหมด (เหมือน db.all)
        const [rows] = await pool.query(sql, params); 
        
        res.json(rows);
    } catch (err) {
        console.error("Error fetching products:", err);
        // ส่งข้อความ Error กลับไป
        res.status(500).json({ success: false, message: "Database query failed." });
    }
};


// --- [แก้ไข] เปลี่ยนเป็น pool.execute ---
exports.createProduct = async (req, res) => {
    try {
        const { name, price, description, category_id, color, gender } = req.body;

        if (!req.file) {
            return res.status(400).json({ success: false, message: "No image uploaded" });
        }

        // 1. Upload new image to S3 (ไม่มีการเปลี่ยนแปลง)
        const fileKey = `Picture/${uuidv4()}_${req.file.originalname}`;
        const uploadParams = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: fileKey,
            Body: req.file.buffer,
            ACL: "public-read",
            ContentType: req.file.mimetype
        };

        const uploadResult = await s3.upload(uploadParams).promise();
        const imageUrl = uploadResult.Location;

        // 2. Insert product data into database
        const sql = `INSERT INTO Product 
            (name, price, description, category_id, color, gender, image_url)
            VALUES (?, ?, ?, ?, ?, ?, ?)`;

        // ใช้ pool.execute เพื่อทำ INSERT (เหมือน db.run)
        const [result] = await pool.execute(sql, [name, price, description, category_id, color, gender, imageUrl]);
        
        // ถ้า Insert สำเร็จ 
        res.json({ success: true, message: "Product created successfully", productId: result.insertId });

    } catch (err) {
        // หาก Insert ล้มเหลว ต้องลบรูปภาพจาก S3 ด้วย
        console.error("Error creating product:", err);
        
        // พยายามลบรูปภาพออกจาก S3 (ถ้า fileKey ถูกกำหนดแล้ว)
        if (typeof fileKey !== 'undefined') {
             try {
                 await s3.deleteObject({ Bucket: process.env.AWS_BUCKET_NAME, Key: fileKey }).promise();
                 console.log("Uploaded S3 image deleted due to DB error.");
             } catch (s3Err) {
                 console.error("Failed to clean up S3 image:", s3Err);
             }
        }
        
        res.status(500).json({ success: false, message: "Server error during product creation" });
    }
};


// --- [แก้ไข] เปลี่ยนการค้นหาและอัปเดตเป็น pool.execute/pool.query ---
exports.updateProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        const { name, price, description, category_id, color, gender } = req.body;
        let imageUrl;

        // Step 1: ค้นหาข้อมูลสินค้าเดิม (โดยเฉพาะ URL รูปเก่า)
        // ใช้ pool.query หรือ execute แล้วดึง rows[0]
        const [rows] = await pool.query("SELECT image_url FROM Product WHERE product_id = ?", [productId]);
        const product = rows[0]; 

        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }
        
        // Step 2: ตรวจสอบว่ามีการอัปโหลดไฟล์รูปใหม่หรือไม่ (ไม่มีการเปลี่ยนแปลง)
        if (req.file) {
            // 2a. อัปโหลดรูปใหม่ขึ้น S3
            const newFileKey = `Picture/${uuidv4()}_${req.file.originalname}`;
            const uploadParams = {
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: newFileKey,
                Body: req.file.buffer,
                ACL: "public-read",
                ContentType: req.file.mimetype
            };
            const uploadResult = await s3.upload(uploadParams).promise();
            imageUrl = uploadResult.Location;

            // 2b. [สำคัญ] ลบรูปเก่าออกจาก S3
            const oldFileKey = getKeyFromUrl(product.image_url);
            if (oldFileKey) {
                await s3.deleteObject({ Bucket: process.env.AWS_BUCKET_NAME, Key: oldFileKey }).promise();
            }
        } else {
            // ถ้าไม่มีการอัปโหลดไฟล์ใหม่ ให้ใช้ URL รูปเดิม
            imageUrl = product.image_url;
        }

        // Step 3: อัปเดตข้อมูลใน Database
        const sql = `UPDATE Product SET
            name = ?, price = ?, description = ?, category_id = ?, color = ?, gender = ?, image_url = ?
            WHERE product_id = ?`;

        // ใช้ pool.execute เพื่อทำ UPDATE (เหมือน db.run)
        const [updateResult] = await pool.execute(sql, [name, price, description, category_id, color, gender, imageUrl, productId]);
        
        if (updateResult.affectedRows === 0) {
            // กรณีไม่มีแถวที่ถูกอัปเดต
            return res.status(404).json({ success: false, message: "Product update failed or product not found" });
        }
        
        res.json({ success: true, message: "Product updated successfully" });

    } catch (err) {
        console.error("Error updating product:", err);
        res.status(500).json({ success: false, message: "Server error during product update" });
    }
};

// --- [แก้ไข] เปลี่ยนการค้นหาและลบเป็น pool.execute/pool.query ---
exports.deleteProduct = async (req, res) => {
    try {
        const productId = req.params.id; 

        // Step 1: ดึง URL รูปภาพจาก DB ก่อนที่จะลบข้อมูล
        const [rows] = await pool.query("SELECT image_url FROM Product WHERE product_id = ?", [productId]);
        const row = rows[0];

        if (!row) return res.status(404).json({ success: false, message: "Product not found" });

        // Step 2: [สำคัญ] ลบรูปภาพออกจาก S3 (ไม่มีการเปลี่ยนแปลง)
        const fileKey = getKeyFromUrl(row.image_url);
        if (fileKey) {
            await s3.deleteObject({ Bucket: process.env.AWS_BUCKET_NAME, Key: fileKey }).promise();
        }

        // Step 3: ลบข้อมูลสินค้าออกจาก Database
        // ใช้ pool.execute เพื่อทำ DELETE (เหมือน db.run)
        const [deleteResult] = await pool.execute("DELETE FROM Product WHERE product_id = ?", [productId]);
        
        if (deleteResult.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Product delete failed or product not found" });
        }
        
        res.json({ success: true, message: "Product deleted successfully" });
        
    } catch (err) {
        console.error("Error deleting product:", err);
        res.status(500).json({ success: false, message: "Server error during product deletion" });
    }
};

exports.showCreateProductPage = (req, res) => {
    res.render("create-product"); 
};

// --- [แก้ไข] เปลี่ยนการค้นหาเป็น pool.query ---
exports.showEditProductPage = async (req, res) => {
    try {
        const productId = req.params.id;
        const sql = "SELECT * FROM Product WHERE product_id = ?";
        
        const [rows] = await pool.query(sql, [productId]);
        const row = rows[0];
        
        if (!row) {
            return res.status(404).send("Product not found");
        }
        
        res.render("edit-product", { product: row });
    } catch (err) {
        console.error("Error showing edit page:", err);
        return res.status(500).send("Server error");
    }
};