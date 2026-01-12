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
  category: String,
  wattage: String,
  voltage: String,
  batteryType: String,
  reviews: [reviewsSchema],
}, { timestamps: true });

module.exports = mongoose.model("products", productsSchema);
