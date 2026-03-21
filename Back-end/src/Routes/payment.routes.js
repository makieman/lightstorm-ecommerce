const express = require('express');
const router = express.Router();
const {
  initiatePay,
  mpesaCallback,
  checkPaymentStatus
} = require('../Controllers/payment.controller');

router.post('/stkpush', initiatePay);
router.post('/callback', mpesaCallback);
router.get('/status/:checkoutRequestId', checkPaymentStatus);

module.exports = router;
