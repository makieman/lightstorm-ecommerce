const express = require("express");
const router = express.Router();
const adminMiddleware = require("../Middlewares/admin.middleware");
const categoryController = require("../Controllers/category.controller");
const productModel = require("../Models/product.model");
const mongoose = require("mongoose");

// All admin routes require admin authentication
router.use(adminMiddleware);

// ===================== Category Routes =====================

router.get("/categories", categoryController.getAllCategories);
router.post("/categories", categoryController.createCategory);
router.put("/categories/:id", categoryController.updateCategory);

// ===================== Product Routes =====================

/**
 * GET /api/admin/products/grouped
 * Returns all products grouped by their category
 */
router.get("/products/grouped", async (req, res) => {
    try {
        const grouped = await productModel.aggregate([
            {
                $lookup: {
                    from: "categories",
                    localField: "category",
                    foreignField: "_id",
                    as: "categoryInfo"
                }
            },
            {
                $unwind: {
                    path: "$categoryInfo",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $group: {
                    _id: "$category",
                    category: {
                        $first: {
                            id: "$categoryInfo._id",
                            name: { $ifNull: ["$categoryInfo.name", "Uncategorized"] },
                            slug: "$categoryInfo.slug"
                        }
                    },
                    products: {
                        $push: {
                            _id: "$_id",
                            title: "$title",
                            price: "$price",
                            quantity: "$quantity",
                            lowStockThreshold: "$lowStockThreshold",
                            type: "$type",
                            details: "$details",
                            image: "$image",
                            wattage: "$wattage",
                            voltage: "$voltage",
                            batteryType: "$batteryType",
                            createdBy: "$createdBy",
                            createdAt: "$createdAt",
                            updatedAt: "$updatedAt"
                        }
                    }
                }
            },
            {
                $sort: { "category.name": 1 }
            }
        ]);

        return res.json(grouped);
    } catch (error) {
        console.error("Error in grouped products:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
});

/**
 * PATCH /api/admin/products/:id/stock
 * Update stock quantity for a product
 * Body: { stockQuantity: number }
 */
router.patch("/products/:id/stock", async (req, res) => {
    try {
        const { id } = req.params;
        const { stockQuantity } = req.body;

        // Validate input
        if (stockQuantity === undefined || stockQuantity === null) {
            return res.status(400).json({ message: "stockQuantity is required" });
        }

        const qty = Number(stockQuantity);
        if (isNaN(qty) || !Number.isInteger(qty)) {
            return res.status(400).json({ message: "stockQuantity must be a valid integer" });
        }

        if (qty < 0) {
            return res.status(400).json({ message: "stockQuantity cannot be negative" });
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid product ID" });
        }

        const product = await productModel.findById(id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        const previousQuantity = product.quantity;
        product.quantity = qty;
        await product.save();

        // Log the stock change
        console.log(
            `[STOCK UPDATE] Product: ${product.title} (${id}) | ` +
            `${previousQuantity} -> ${qty} | ` +
            `By admin: ${req.adminUser.username} (${req.adminUser._id}) | ` +
            `At: ${new Date().toISOString()}`
        );

        return res.json({
            message: "Stock updated successfully",
            product: {
                _id: product._id,
                title: product.title,
                quantity: product.quantity,
                previousQuantity,
                lowStockThreshold: product.lowStockThreshold
            }
        });
    } catch (error) {
        console.error("Error updating stock:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
});

module.exports = router;
