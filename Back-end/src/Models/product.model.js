const mongoose = require("mongoose");

let reviewsSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
  name: String, // user name
  comment: String,
  rating: Number,
  date: Date,
});

const productsSchema = new mongoose.Schema({
  title: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, min: 0, default: 0 },
  type: { type: String, enum: ['product', 'service'], default: 'product' },
  details: String,
  image: String,
  category: { type: mongoose.Schema.Types.ObjectId, ref: "categories" },
  lowStockThreshold: { type: Number, default: 5, min: 0 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
  wattage: String,
  voltage: String,
  batteryType: String,
  reviews: [reviewsSchema],
}, { timestamps: true });

// Add text index for search functionality
productsSchema.index({ title: 'text', details: 'text' });
// Index for efficient category-based grouping
productsSchema.index({ category: 1 });

module.exports = mongoose.model("products", productsSchema);
