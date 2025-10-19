// adminController.test.js
const adminController = require("../controllers/adminController");
const db = require("../database/db");
const AWS = require("aws-sdk");

// Mock db functions
jest.mock("../database/db", () => ({
    all: jest.fn(),
    run: jest.fn(),
    get: jest.fn(),
}));

// Mock AWS S3
const mockUploadPromise = jest.fn().mockResolvedValue({ Location: "https://s3.amazonaws.com/bucket/test.png" });
const mockDeletePromise = jest.fn().mockResolvedValue({});

jest.mock("aws-sdk", () => {
    const mS3 = {
        upload: jest.fn(() => ({ promise: mockUploadPromise })),
        deleteObject: jest.fn(() => ({ promise: mockDeletePromise }))
    };
    return { S3: jest.fn(() => mS3) };
});

describe("Admin Controller", () => {

    describe("getProducts", () => {
        it("should return products without filter", () => {
            const req = { query: {} };
            const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
            const fakeProducts = [{ product_id: 1, name: "Test" }];
            
            db.all.mockImplementation((sql, params, callback) => {
                callback(null, fakeProducts);
            });

            adminController.getProducts(req, res);
            expect(res.json).toHaveBeenCalledWith(fakeProducts);
        });

        it("should return 500 on db error", () => {
            const req = { query: {} };
            const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
            
            db.all.mockImplementation((sql, params, callback) => {
                callback(new Error("DB Error"));
            });

            adminController.getProducts(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    describe("createProduct", () => {
        it("should return 400 if no file uploaded", async () => {
            const req = { body: {}, file: null };
            const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

            await adminController.createProduct(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ success: false, message: "No image uploaded" });
        });

        it("should create product successfully", async () => {
            const req = {
                body: { name: "Shirt", price: 100, description: "Test", category_id: 1, color: "Red", gender: "M" },
                file: { originalname: "test.png", buffer: Buffer.from("test"), mimetype: "image/png" }
            };
            const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

            db.run.mockImplementation((sql, params, callback) => callback(null));

            await adminController.createProduct(req, res);

            expect(res.json).toHaveBeenCalledWith({ success: true, message: "Product created successfully" });
        });

        it("should delete S3 object if DB insert fails", async () => {
            const req = {
                body: { name: "Shirt", price: 100, description: "Test", category_id: 1, color: "Red", gender: "M" },
                file: { originalname: "test.png", buffer: Buffer.from("test"), mimetype: "image/png" }
            };
            const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

            db.run.mockImplementation((sql, params, callback) => callback(new Error("DB Error")));

            await adminController.createProduct(req, res);

            expect(AWS.S3().deleteObject).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

});
