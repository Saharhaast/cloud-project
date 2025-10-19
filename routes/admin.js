// routes/admin.js

const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { authenticate, requireAdmin } = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

// Middleware นี้จะทำงานกับทุก Route ที่อยู่ข้างล่างในไฟล์นี้
router.use(authenticate, requireAdmin);

// Route สำหรับแสดงหน้าหลักของ Admin (GET /admin)
router.get("/", adminController.showAdminPage);

// [เพิ่มใหม่] Route สำหรับแสดงหน้า "ฟอร์ม" สร้างสินค้า (GET /admin/products/new)
router.get("/products/new", adminController.showCreateProductPage);

// Route สำหรับดึงข้อมูลสินค้าทั้งหมด (GET /admin/products)
router.get("/products", adminController.getProducts);

// [เพิ่มใหม่] Route สำหรับ "แสดงหน้าฟอร์มแก้ไข"
router.get("/products/:id/edit", adminController.showEditProductPage);

// Route สำหรับ "รับข้อมูลเพื่ออัปเดต" (อันเดิมที่เราทำไว้ ถูกต้องแล้ว)
router.put(
    "/products/:id", 
    upload.single("image"), 
    adminController.updateProduct
);

// Route สำหรับ "ลบ" (อันเดิมที่เราทำไว้ ถูกต้องแล้ว)
router.delete(
    "/products/:id",
    adminController.deleteProduct
);

// Route สำหรับ "รับข้อมูล" จากฟอร์มเพื่อสร้างสินค้า (POST /admin/products)
router.post(
    "/products",
    upload.single("image"), 
    adminController.createProduct
);

// Route สำหรับอัปเดตสินค้า (PUT /admin/products/:id)
router.put(
    "/products/:id", 
    upload.single("image"), 
    adminController.updateProduct
);

// Route สำหรับลบสินค้า (DELETE /admin/products/:id)
router.delete(
    "/products/:id",
    adminController.deleteProduct
);

module.exports = router;