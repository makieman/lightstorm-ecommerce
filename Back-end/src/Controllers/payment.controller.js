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

    // Create pending payment record
    const payment = await Payment.create({
      orderId,
      phone,
      amount,
      status: 'pending',
      userId: req.body.userId
    });

    // Initiate STK push
    const mpesaResponse = await initiateSTKPush({ phone, amount, orderId });

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

    console.log('M-Pesa Callback received:', {
      CheckoutRequestID,
      ResultCode: numericResultCode,
      ResultDesc
    });

    // Find the payment record
    const payment = await Payment.findOne({ checkoutRequestId: CheckoutRequestID });

    if (!payment) {
      console.warn('Payment not found for:', CheckoutRequestID);
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
      // Payment failed or cancelled
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
