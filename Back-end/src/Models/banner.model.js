const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subtitle: { type: String, required: true },
  discount: { type: Number, default: 0 },
  imageUrl: { type: String, default: '' },
  ctaText: { type: String, default: 'Shop Now' },
  ctaLink: { type: String, default: '/shop' },
  isActive: { type: Boolean, default: false },
  startDate: { type: Date, default: null },
  endDate: { type: Date, default: null },
  bgColor: { 
    type: String, 
    default: 'from-orange-500 via-yellow-400 to-green-500' 
  },
  linkedProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Banner', bannerSchema);
