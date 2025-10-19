const bcrypt = require("bcrypt");
const db = require("../database/db"); 

const email = "admin@god.com";
const password = "admin123";
const role = "admin";

bcrypt.hash(password, 10, (err, hash) => {
    if (err) {
        console.error("Error hashing password:", err);
        return;
    }

    const sql = "INSERT INTO Customer (email, password, role) VALUES (?, ?, ?)";
    db.run(sql, [email, hash, role], function (err) {
        if (err) {
            console.error("Error inserting admin:", err.message);
        } else {
            console.log(`✅ Admin created with ID ${this.lastID}`);
        }
        process.exit();
    });
});
