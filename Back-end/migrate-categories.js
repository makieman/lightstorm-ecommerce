/**
 * Migration Script: Convert plain string categories to Category ObjectId references
 * 
 * Run once: node migrate-categories.js
 * 
 * This script:
 * 1. Reads all distinct category strings from existing products
 * 2. Creates Category documents for each unique category
 * 3. Updates all products to reference the new Category ObjectIds
 */

const mongoose = require("mongoose");
require("dotenv").config();

const CategoryModel = require("./src/Models/category.model");
const ProductModel = require("./src/Models/product.model");

const DATABASE_URL = process.env.DATABASE_URL;

async function migrate() {
    try {
        await mongoose.connect(DATABASE_URL);
        console.log("Connected to MongoDB");

        // Step 1: Get all distinct category strings from products
        const distinctCategories = await mongoose.connection.db
            .collection("products")
            .distinct("category");

        // Filter out null/undefined/empty and ObjectIds (already migrated)
        const stringCategories = distinctCategories.filter(
            (cat) => typeof cat === "string" && cat.trim() !== ""
        );

        if (stringCategories.length === 0) {
            console.log("No string categories found. Migration may have already run.");
            await mongoose.disconnect();
            return;
        }

        console.log(`Found ${stringCategories.length} distinct categories:`, stringCategories);

        // Step 2: Create Category documents for each
        const categoryMap = {};
        for (const catName of stringCategories) {
            let existing = await CategoryModel.findOne({ name: catName });
            if (!existing) {
                existing = await CategoryModel.create({ name: catName });
                console.log(`Created category: ${catName} -> ${existing._id}`);
            } else {
                console.log(`Category already exists: ${catName} -> ${existing._id}`);
            }
            categoryMap[catName] = existing._id;
        }

        // Step 3: Update all products to reference Category ObjectIds
        let updatedCount = 0;
        for (const [catName, catId] of Object.entries(categoryMap)) {
            const result = await mongoose.connection.db
                .collection("products")
                .updateMany(
                    { category: catName },
                    { $set: { category: catId } }
                );
            updatedCount += result.modifiedCount;
            console.log(`Updated ${result.modifiedCount} products for category: ${catName}`);
        }

        console.log(`\nMigration complete! Updated ${updatedCount} products total.`);
        console.log("Categories created:", Object.keys(categoryMap).length);

        await mongoose.disconnect();
    } catch (error) {
        console.error("Migration failed:", error);
        await mongoose.disconnect();
        process.exit(1);
    }
}

migrate();
