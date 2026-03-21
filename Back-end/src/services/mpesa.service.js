const axios = require('axios');

const MPESA_BASE_URL = 'https://sandbox.safaricom.co.ke';

// Step 1: Get access token
const getAccessToken = async () => {
  const auth = Buffer.from(
    `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`
  ).toString('base64');

  const response = await axios.get(
    `${MPESA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials`,
    { headers: { Authorization: `Basic ${auth}` } }
  );

  return response.data.access_token;
};

// Step 2: Generate password
const generatePassword = () => {
  const timestamp = new Date()
    .toISOString()
    .replace(/[^0-9]/g, '')
    .slice(0, 14);

  const password = Buffer.from(
    `${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`
  ).toString('base64');

  return { password, timestamp };
};

// Step 3: Initiate STK Push
const initiateSTKPush = async ({ phone, amount, orderId }) => {
  const token = await getAccessToken();
  const { password, timestamp } = generatePassword();

  // Format phone: 0712345678 -> 254712345678
  const formattedPhone = phone.startsWith('0')
    ? `254${phone.slice(1)}`
    : phone.startsWith('+')
      ? phone.slice(1)
      : phone;

  const payload = {
    BusinessShortCode: process.env.MPESA_SHORTCODE,
    Password: password,
    Timestamp: timestamp,
    TransactionType: 'CustomerPayBillOnline',
    Amount: Math.ceil(amount),
    PartyA: formattedPhone,
    PartyB: process.env.MPESA_SHORTCODE,
    PhoneNumber: formattedPhone,
    CallBackURL: process.env.MPESA_CALLBACK_URL,
    AccountReference: `Lightstorm-${orderId}`,
    TransactionDesc: `Payment for order ${orderId}`
  };

  const response = await axios.post(
    `${MPESA_BASE_URL}/mpesa/stkpush/v1/processrequest`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );

  return response.data;
};

module.exports = { getAccessToken, initiateSTKPush };
