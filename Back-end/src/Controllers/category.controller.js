const CategoryModel = require("../Models/category.model");

/**
 * Get all active categories
 */
const getAllCategories = async (req, res) => {
    try {
        const categories = await CategoryModel.find({ isActive: true })
            .sort({ name: 1 });
        return res.json(categories);
    } catch (error) {
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

/**
 * Create a new category
 */
const createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;

        if (!name || typeof name !== "string" || name.trim() === "") {
            return res.status(400).json({ message: "Category name is required" });
        }

        // Check for duplicate
        const existing = await CategoryModel.findOne({
            name: { $regex: new RegExp(`^${name.trim()}$`, "i") }
        });
        if (existing) {
            return res.status(409).json({ message: "Category already exists" });
        }

        const category = new CategoryModel({
            name: name.trim(),
            description: description || ""
        });
        await category.save();

        return res.status(201).json(category);
    } catch (error) {
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

/**
 * Update a category
 */
const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, isActive } = req.body;

        const category = await CategoryModel.findById(id);
        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }

        if (name !== undefined) category.name = name.trim();
        if (description !== undefined) category.description = description;
        if (isActive !== undefined) category.isActive = isActive;

        await category.save();
        return res.json(category);
    } catch (error) {
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

module.exports = {
    getAllCategories,
    createCategory,
    updateCategory
};
