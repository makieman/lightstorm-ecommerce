const { initiateSTKPush } = require('../services/mpesa.service');
const Payment = require('../Models/payment.model');

// POST /api/payments/stkpush
const initiatePay = async (req, res) => {
  try {
    const { phone, amount, orderId } = req.body;

    if (!phone || !amount || !orderId) {
      return res.status(400).json({
        success: false,
        message: 'Phone, amount and orderId are required'
      });
    }

    // Validate amount server-side
    const parsedAmount = Number(amount);
    if (!parsedAmount || parsedAmount < 1 || parsedAmount > 500000 || isNaN(parsedAmount)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment amount'
      });
    }

    // Validate and sanitize phone number
    const phoneRegex = /^(07|01|2547|2541)\d{8}$/;
    const cleanPhone = String(phone).replace(/\s/g, '');
    if (!phoneRegex.test(cleanPhone)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid M-Pesa phone number format'
      });
    }

    // Prevent duplicate payments — check for recent pending payment
    const existingPending = await Payment.findOne({
      orderId,
      status: 'pending',
      createdAt: { $gte: new Date(Date.now() - 5 * 60 * 1000) }
    });
    if (existingPending) {
      return res.status(400).json({
        success: false,
        message: 'A payment for this order is already pending'
      });
    }

    // Create pending payment record
    const payment = await Payment.create({
      orderId,
      phone: cleanPhone,
      amount: parsedAmount,
      status: 'pending',
      userId: req.body.userId
    });

    // Initiate STK push
    const mpesaResponse = await initiateSTKPush({ phone: cleanPhone, amount: parsedAmount, orderId });

    if (mpesaResponse.ResponseCode === '0') {
      // Update payment with Safaricom reference IDs
      await Payment.findByIdAndUpdate(payment._id, {
        checkoutRequestId: mpesaResponse.CheckoutRequestID,
        merchantRequestId: mpesaResponse.MerchantRequestID
      });

      return res.status(200).json({
        success: true,
        message: 'STK Push sent. Check your phone.',
        checkoutRequestId: mpesaResponse.CheckoutRequestID,
        paymentId: payment._id
      });
    }

    await Payment.findByIdAndUpdate(payment._id, { status: 'failed' });
    return res.status(400).json({
      success: false,
      message: mpesaResponse.ResponseDescription || 'STK Push failed'
    });
  } catch (error) {
    console.error('STK Push error:', error.response?.data || error.message);
    return res.status(500).json({
      success: false,
      message: 'Payment initiation failed. Please try again.'
    });
  }
};

// POST /api/payments/callback <- Safaricom calls this
const mpesaCallback = async (req, res) => {
  try {
    const { Body } = req.body || {};
    const { stkCallback } = Body || {};

    if (!stkCallback) {
      return res.status(200).json({ ResultCode: 0, ResultDesc: 'Accepted' });
    }

    const {
      CheckoutRequestID,
      ResultCode,
      ResultDesc,
      CallbackMetadata
    } = stkCallback;
    const numericResultCode = Number(ResultCode);

    // Find the payment record
    const payment = await Payment.findOne({ checkoutRequestId: CheckoutRequestID });

    if (!payment) {
      console.warn('Payment not found for:', CheckoutRequestID);
      return res.status(200).json({ ResultCode: 0, ResultDesc: 'Accepted' });
    }

    // Prevent double-processing: if already in a terminal state, accept but don't re-process
    if (payment.status === 'success') {
      console.log('Payment already processed:', CheckoutRequestID);
      return res.status(200).json({ ResultCode: 0, ResultDesc: 'Accepted' });
    }

    if (numericResultCode === 0) {
      // Payment successful - extract metadata
      const items = CallbackMetadata?.Item || [];
      const getMeta = (name) =>
        items.find((i) => i.Name === name)?.Value || null;

      await Payment.findByIdAndUpdate(payment._id, {
        status: 'success',
        resultCode: numericResultCode,
        resultDesc: ResultDesc,
        mpesaReceiptNumber: getMeta('MpesaReceiptNumber'),
        transactionDate: String(getMeta('TransactionDate')),
        amount: getMeta('Amount') || payment.amount,
        phone: String(getMeta('PhoneNumber') || payment.phone)
      });

      console.log('Payment SUCCESS:', getMeta('MpesaReceiptNumber'));
    } else {
      // Payment failed or cancelled — only update if still pending
      if (payment.status !== 'pending') {
        return res.status(200).json({ ResultCode: 0, ResultDesc: 'Accepted' });
      }
      await Payment.findByIdAndUpdate(payment._id, {
        status: numericResultCode === 1032 ? 'cancelled' : 'failed',
        resultCode: numericResultCode,
        resultDesc: ResultDesc
      });

      console.log('Payment FAILED:', ResultDesc);
    }

    // Always respond 200 to Safaricom
    return res.status(200).json({ ResultCode: 0, ResultDesc: 'Accepted' });
  } catch (error) {
    console.error('Callback error:', error);
    return res.status(200).json({ ResultCode: 0, ResultDesc: 'Accepted' });
  }
};

// GET /api/payments/status/:checkoutRequestId
// Angular polls this to know if payment succeeded
const checkPaymentStatus = async (req, res) => {
  try {
    const { checkoutRequestId } = req.params;

    const payment = await Payment.findOne({ checkoutRequestId });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    return res.status(200).json({
      success: true,
      status: payment.status,
      mpesaReceiptNumber: payment.mpesaReceiptNumber,
      amount: payment.amount,
      resultDesc: payment.resultDesc
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error checking payment status'
    });
  }
};

module.exports = { initiatePay, mpesaCallback, checkPaymentStatus };
