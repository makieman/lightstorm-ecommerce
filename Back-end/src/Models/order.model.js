const mongoose = require("mongoose");

const OredersSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "users", index: true },
  username: String,
  date: Date,
  totalPrice: Number,
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: "products" }],
  status: { type: String, enum: ['Pending', 'Accepted', 'Rejected'], default: 'Pending' },
});

module.exports = mongoose.model("orders", OredersSchema);
