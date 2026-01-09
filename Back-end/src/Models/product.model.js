const mongoose = require("mongoose");

let reviewsSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
  name: String, // user name
  comment: String,
  rating: Number,
  date: Date,
});

const productsSchema = new mongoose.Schema({
  id: String,
  title: String,
  price: Number,
  stock: { type: Number, minimum: 0 }, // availability
  type: { type: String, enum: ['product', 'service'], default: 'product' },
  description: String,
  images: [String],
  category: String,
  reviews: [reviewsSchema] || [],
});

module.exports = mongoose.model("products", productsSchema);
