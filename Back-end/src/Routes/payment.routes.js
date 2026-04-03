const express = require('express');
const router = express.Router();
const requireAuth = require('../Middlewares/auth.middleware');
const {
  initiatePay,
  mpesaCallback,
  checkPaymentStatus
} = require('../Controllers/payment.controller');

router.post('/stkpush', requireAuth, initiatePay);
router.post('/callback', mpesaCallback);  // Intentionally open — Safaricom calls this
router.get('/status/:checkoutRequestId', requireAuth, checkPaymentStatus);

module.exports = router;
