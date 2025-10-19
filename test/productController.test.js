// productController.test.js
const productController = require("../controllers/productController");
const Product = require("../models/productModel");
const Cart = require("../models/cartModel");

// Mock models
jest.mock("../models/productModel");
jest.mock("../models/cartModel");

describe("Product Controller", () => {
    let req, res;

    beforeEach(() => {
        req = { body: {}, query: {}, user: { customer_id: 1 } };
        res = {
            render: jest.fn(),
            send: jest.fn(),
            json: jest.fn(),
            status: jest.fn().mockReturnThis(),
        };
        jest.clearAllMocks();
    });

    // ---------------- Detail Page ----------------
    describe("detailPage", () => {
        it("should return 401 if no user", async () => {
            req.user = null;
            await productController.detailPage(req, res);
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.send).toHaveBeenCalledWith("Unauthorized");
        });

        it("should return 404 if product not found", async () => {
            Product.getByIdAsync.mockResolvedValue(null);
            await productController.detailPage(req, res);
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.send).toHaveBeenCalledWith("Product not found");
        });

        it("should render detail page with recommended products", async () => {
            const fakeProduct = { product_id: 1, name: "Test" };
            const allProducts = [
                { product_id: 2 }, { product_id: 3 },
                { product_id: 4 }, { product_id: 5 },
                { product_id: 6 }
            ];

            Product.getByIdAsync.mockResolvedValue(fakeProduct);
            Product.getAllAsync.mockResolvedValue(allProducts);

            await productController.detailPage(req, res);

            expect(res.render).toHaveBeenCalledWith("detail", {
                product: fakeProduct,
                recommendedProducts: allProducts.slice(0, 4),
                customer_id: req.user.customer_id
            });
        });
    });

    // ---------------- Add To Cart ----------------
    describe("addToCart", () => {
        it("should return 401 if no user", async () => {
            req.user = null;
            await productController.addToCart(req, res);
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.send).toHaveBeenCalledWith("Unauthorized");
        });

        it("should add item to cart", async () => {
            req.body = { product_id: 1, quantity: 2 };
            Cart.addOrUpdateAsync.mockResolvedValue();

            await productController.addToCart(req, res);

            expect(Cart.addOrUpdateAsync).toHaveBeenCalledWith(1, 1, 2);
            expect(res.send).toHaveBeenCalledWith("Added to cart");
        });

        it("should handle database error", async () => {
            req.body = { product_id: 1, quantity: 2 };
            Cart.addOrUpdateAsync.mockRejectedValue(new Error("DB Error"));

            await productController.addToCart(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith("Database error");
        });
    });

    // ---------------- Get Cart ----------------
    describe("getCart", () => {
        it("should return cart items as JSON", async () => {
            const fakeCart = [{ product_id: 1, quantity: 2 }];
            Cart.getByCustomerAsync.mockResolvedValue(fakeCart);

            await productController.getCart(req, res);

            expect(res.json).toHaveBeenCalledWith(fakeCart);
        });
    });

    // ---------------- Update Cart ----------------
    describe("updateCart", () => {
        it("should update quantity", async () => {
            req.body = { product_id: 1, quantity: 5 };
            Cart.updateQuantityAsync.mockResolvedValue();

            await productController.updateCart(req, res);

            expect(Cart.updateQuantityAsync).toHaveBeenCalledWith(1, 1, 5);
            expect(res.send).toHaveBeenCalledWith("Cart updated");
        });
    });

    // ---------------- Remove Cart Item ----------------
    describe("removeCartItem", () => {
        it("should remove item from cart", async () => {
            req.body = { product_id: 1 };
            Cart.removeAsync.mockResolvedValue();

            await productController.removeCartItem(req, res);

            expect(Cart.removeAsync).toHaveBeenCalledWith(1, 1);
            expect(res.json).toHaveBeenCalledWith({ success: true });
        });
    });

    // ---------------- Clear Cart ----------------
    describe("clearCart", () => {
        it("should clear cart", async () => {
            Cart.clearAsync.mockResolvedValue();

            await productController.clearCart(req, res);

            expect(Cart.clearAsync).toHaveBeenCalledWith(1);
            expect(res.json).toHaveBeenCalledWith({ success: true });
        });
    });
});
