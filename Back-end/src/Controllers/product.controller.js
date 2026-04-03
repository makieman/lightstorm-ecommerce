const productModel = require("../Models/product.model");
const categoryModel = require("../Models/category.model");
const productValidate = require("../Middlewares/product.validation");
const userModel = require("../Models/user.model");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error("JWT_SECRET env var is required");
const mongoose = require("mongoose");
const cloudUpload = require("../services/cloudinary.service");
const { escapeRegex } = require("../Utils/sanitize");

/**
 * Helper: Get images array with backward compatibility
 * If images array exists, return it; otherwise convert old image field to array
 */
const getProductImages = (product) => {
  if (product.images && product.images.length > 0) {
    return product.images;
  }
  return product.image ? [product.image] : [];
};

/**
 * Get all Products with optional category filter
 */
const getAllProducts = async (req, res) => {
  try {
    // --- Filtering ---
    let query = {};
    const { minPrice, maxPrice, category, search, sort } = req.query;

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice && !isNaN(Number(minPrice))) {
        query.price.$gte = Number(minPrice);
      }
      if (maxPrice && !isNaN(Number(maxPrice))) {
        query.price.$lte = Number(maxPrice);
      }
    }

    if (category && category !== 'All Categories') {
      // Support both ObjectId and string-based category filtering
      if (mongoose.Types.ObjectId.isValid(category)) {
        query.category = new mongoose.Types.ObjectId(category);
      } else {
        // Lookup category by name
        const cat = await categoryModel.findOne({ name: { $regex: new RegExp(`^${escapeRegex(category)}$`, 'i') } });
        if (cat) {
          query.category = cat._id;
        } else {
          query.category = null; // No matching category, will return empty
        }
      }
    }

    if (search) {
      // Using text index for performance
      query.$text = { $search: search };
    }

    // --- Sorting ---
    let sortOption = { createdAt: -1 }; // Default sort: newest first
    if (sort) {
      const parts = sort.startsWith('-') ? [sort.substring(1), -1] : [sort, 1];
      sortOption = { [parts[0]]: parts[1] };
    }

    // --- Pagination ---
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 24;
    const skip = (page - 1) * limit;

    // --- Database Query ---
    const [totalItems, products] = await Promise.all([
      productModel.countDocuments(query),
      productModel.find(query)
        .select('title price quantity type details image images category lowStockThreshold wattage voltage batteryType createdAt updatedAt')
        .populate('category', 'name slug')
        .sort(sortOption)
        .skip(skip)
        .limit(limit)
        .lean()
    ]);

    // Add backward compatibility: convert image to images array in response
    const productsWithImages = products.map(product => ({
      ...product,
      images: getProductImages(product)
    }));

    const totalPages = Math.ceil(totalItems / limit);

    res.set('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600');

    res.json({
      products: productsWithImages,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages
      }
    });
  } catch (err) {
    console.error('ERROR in getAllProducts:', err);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};

/**
 * Get Featured Products (Top 4)
 */
const getFeaturedProducts = async (req, res) => {
  try {
    const products = await productModel.find({})
      .select('title price quantity type details image images category lowStockThreshold wattage voltage batteryType createdAt updatedAt')
      .sort({ createdAt: -1 })
      .limit(4)
      .lean();

    // Add backward compatibility
    const productsWithImages = products.map(product => ({
      ...product,
      images: getProductImages(product)
    }));

    res.set('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600');
    res.json(productsWithImages);
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};

/**
 * Get Product by name
 */
let getProductByName = async (req, res) => {
  //
};

/**
 * Get Product by ID
 */
let getProductByID = async (req, res) => {
  try {
    let product = await productModel.findById(req.params.id).populate('category', 'name slug');
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    // Add backward compatibility: convert image to images array
    const response = product.toObject();
    response.images = getProductImages(response);
    return res.json(response);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Create a new Product
 */
let createNewProduct = async (req, res) => {
  try {
    // Convert string prices/quantities to numbers for validation
    if (req.body.price) req.body.price = Number(req.body.price);

    // Map frontend field names to backend expected names
    if (req.body.productQuantity) {
      req.body.quantity = Number(req.body.productQuantity);
      delete req.body.productQuantity;
    } else if (req.body.quantity) {
      req.body.quantity = Number(req.body.quantity);
    }

    if (req.body.productCategory) {
      req.body.category = req.body.productCategory;
      delete req.body.productCategory;
    }

    // Only remove empty optional fields (not required ones)
    const optionalFields = ['wattage', 'voltage', 'batteryType', 'type'];
    optionalFields.forEach(field => {
      if (req.body[field] === '' || req.body[field] === undefined || req.body[field] === null) {
        delete req.body[field];
      }
    });

    const isValid = productValidate(req.body);
    if (!isValid) {
      console.error('Validation errors:', productValidate.errors);
      return res.status(400).json({
        message: productValidate.errors.map(err => `${err.instancePath} ${err.message}`).join(', ')
      });
    }

    // Resolve category: accept ObjectId or name string
    let categoryId = req.body.category;
    if (categoryId && !mongoose.Types.ObjectId.isValid(categoryId)) {
      const cat = await categoryModel.findOne({ name: { $regex: new RegExp(`^${escapeRegex(categoryId)}$`, 'i') } });
      if (cat) {
        categoryId = cat._id;
      } else {
        // Auto-create category if it doesn't exist
        const newCat = await categoryModel.create({ name: categoryId });
        categoryId = newCat._id;
      }
    }

    let productData = {
      title: req.body.title,
      details: req.body.details,
      price: req.body.price,
      quantity: req.body.quantity || 0,
      category: categoryId,
      type: req.body.type || 'product',
      lowStockThreshold: req.body.lowStockThreshold || 5,
      wattage: req.body.wattage,
      voltage: req.body.voltage,
      batteryType: req.body.batteryType
    };

    // Handle multiple image uploads (up to 5)
    if (req.files && req.files.length > 0) {
      try {
        const filesToUpload = req.files.slice(0, 5); // Limit to 5 images
        const uploadPromises = filesToUpload.map(file => cloudUpload(file.path));
        const uploadedImages = await Promise.all(uploadPromises);
        
        productData.images = uploadedImages.map(u => u.url);
        // Also set first image as legacy 'image' field for backward compatibility
        if (uploadedImages.length > 0) {
          productData.image = uploadedImages[0].url;
        }
        
        // Clean up local files after Cloudinary upload
        filesToUpload.forEach(file => {
          try { fs.unlinkSync(file.path); } catch (e) { /* ignore */ }
        });
      } catch (uploadError) {
        console.error('Image upload error:', uploadError);
        return res.status(500).json({
          message: "Error uploading images",
          error: uploadError.message
        });
      }
    }

    let product = new productModel(productData);
    await product.save();
    return res.json({ message: "Product Added Successfully" });
  } catch (error) {
    console.error('CRITICAL ERROR:', error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
};

/**
 * Update Product by ID
 */
let updateProductByID = async (req, res) => {
  try {
    let product = await productModel.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Update images if uploaded (up to 5)
    if (req.files && req.files.length > 0) {
      try {
        const filesToUpload = req.files.slice(0, 5); // Limit to 5 images
        const uploadPromises = filesToUpload.map(file => cloudUpload(file.path));
        const uploadedImages = await Promise.all(uploadPromises);
        
        product.images = uploadedImages.map(u => u.url);
        // Also set first image as legacy 'image' field for backward compatibility
        if (uploadedImages.length > 0) {
          product.image = uploadedImages[0].url;
        }
        
        // Clean up local files after Cloudinary upload
        filesToUpload.forEach(file => {
          try { fs.unlinkSync(file.path); } catch (e) { /* ignore */ }
        });
      } catch (uploadError) {
        console.error('Image upload error:', uploadError);
        return res.status(500).json({
          message: "Error uploading images",
          error: uploadError.message
        });
      }
    }

    // Standardize body fields
    const {
      title, details, price, quantity, productQuantity,
      category, productCategory, type, wattage, voltage, batteryType
    } = req.body;

    if (title !== undefined) product.title = title;
    if (details !== undefined) product.details = details;
    if (price !== undefined) product.price = Number(price);
    if (quantity !== undefined) product.quantity = Number(quantity);
    if (productQuantity !== undefined) product.quantity = Number(productQuantity);
    // Resolve category string to ObjectId if needed
    const rawCategory = productCategory || category;
    if (rawCategory !== undefined) {
      if (mongoose.Types.ObjectId.isValid(rawCategory)) {
        product.category = rawCategory;
      } else {
        const cat = await categoryModel.findOne({ name: { $regex: new RegExp(`^${escapeRegex(rawCategory)}$`, 'i') } });
        if (cat) {
          product.category = cat._id;
        } else {
          const newCat = await categoryModel.create({ name: rawCategory });
          product.category = newCat._id;
        }
      }
    }
    if (type !== undefined) product.type = type;
    if (wattage !== undefined) product.wattage = wattage;
    if (voltage !== undefined) product.voltage = voltage;
    if (batteryType !== undefined) product.batteryType = batteryType;

    // Save the document
    const productUpdated = await product.save();

    return res.json(productUpdated);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * Delete Product by ID
 */
let deleteProductByID = async (req, res) => {
  try {
    let product = await productModel.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    return res.json({ message: "Product deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};
/**
 * Add Review Method
 * Uses authenticated user's ID from token instead of accepting user_id from body
 */
let addReview = async (req, res) => {
  const { comment, rating } = req.body;
  const { id } = req.params;

  // Get user identity from authenticated user (set by requireAuth middleware)
  const user_id = req.user ? req.user._id.toString() : null;
  const reviewerName = req.user ? req.user.username : null;
  if (!user_id) {
    return res.status(401).json({ message: "Unauthorized: User not authenticated" });
  }

  try {
    const product = await productModel.findById(id).exec();
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    const existingReview = product.reviews.find((review) => {
      if (review.user_id) {
        return review.user_id.toString() === user_id;
      }
    });
    if (existingReview) {
      product.reviews.splice(product.reviews.indexOf(existingReview), 1);
    }
    const review = {
      user_id,
      name: reviewerName,
      comment,
      rating,
      date: new Date(),
    };
    product.reviews.push(review);
    await product.save();
    return res
      .status(201)
      .json({ message: "Review added successfully", review });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Get User by Token
 */
const getUserByToken = async (req, res) => {
  try {
    const cookie = req.cookies["jwt"];
    if (!cookie) {
      return res
        .status(401)
        .json({ message: "Unauthorized: JWT cookie not found" });
    }
    const claims = jwt.verify(cookie, JWT_SECRET);
    if (!claims) {
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }

    let user = await userModel.findOne({ _id: claims._id });
    if (!user) {
      return res.status(401).json({ message: "Unauthorized: User not found" });
    }
    const { isTokenInvalidatedByPasswordChange } = require('../Utils/auth.utils');
    if (isTokenInvalidatedByPasswordChange(claims, user)) {
      return res.status(401).json({ message: 'Unauthorized: Token invalidated due to password change.' });
    }

    const { password, ...data } = user.toJSON();
    return res.json({ data: data });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

/**
 * add to cart
 */

let addToCart = async (req, res) => {
  const { user_id, product, quantity } = req.body;

  try {
    const user = await userModel.findById(user_id);
    const productt = await productModel.findById(product);

    if (!user || !productt) {
      return res.status(404).json({ message: "User or product not found" });
    }

    const existingItem = user.carts.find(
      (item) => item.product.toString() === product
    );

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      existingItem.quantity = newQuantity;
      productt.quantity -= quantity;
      await productt.save();
    } else {
      user.carts.push({ product: product, quantity: quantity });
      productt.quantity -= quantity;
      await productt.save();
    }
    await user.save();
    return res
      .status(201)
      .json({ message: "Item added to cart successfully", user });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  getAllProducts,
  getFeaturedProducts,
  getProductByName,
  getProductByID,
  createNewProduct,
  updateProductByID,
  deleteProductByID,
  addReview,
  getUserByToken,
  addToCart,
};
