// middleware/upload.js
const multer = require("multer");
const storage = multer.memoryStorage(); // เก็บไฟล์ชั่วคราวใน memory
const upload = multer({ storage });

module.exports = upload;
