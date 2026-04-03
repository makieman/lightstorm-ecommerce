const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  orderId: { type: String, required: true },
  phone: { type: String, required: true },
  amount: { type: Number, required: true },
  checkoutRequestId: { type: String, index: true },
  merchantRequestId: { type: String },
  mpesaReceiptNumber: { type: String },
  status: {
    type: String,
    enum: ['pending', 'success', 'failed', 'cancelled'],
    default: 'pending'
  },
  resultCode: { type: Number },
  resultDesc: { type: String },
  transactionDate: { type: String },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
