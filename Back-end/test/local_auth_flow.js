(async () => {
  try {
    // Lightweight local auth flow smoke test
    const nodemailer = require('nodemailer');
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const mongoose = require('mongoose');
    const supertest = require('supertest');

    // Create Ethereal test account and a real transport we can use to send mail
    const testAccount = await nodemailer.createTestAccount();
    const realTransport = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: { user: testAccount.user, pass: testAccount.pass }
    });

    // Capture last sent email info
    let lastSentInfo = null;
    const fakeTransport = {
      sendMail: async (mailOptions) => {
        const info = await realTransport.sendMail(mailOptions);
        lastSentInfo = info;
        return info;
      }
    };

    // Monkeypatch nodemailer's createTransport BEFORE app/email service is required
    nodemailer.createTransport = () => fakeTransport;

    // Set required env vars BEFORE loading app so email.service and transporter pick them up
    process.env.SMTP_HOST = testAccount.smtp.host;
    process.env.SMTP_PORT = String(testAccount.smtp.port);
    process.env.SMTP_USER = testAccount.user;
    process.env.SMTP_PASS = testAccount.pass;
    process.env.APP_URL = 'http://localhost:4200';
    process.env.JWT_SECRET = 'test-secret-1234';
    process.env.NODE_ENV = 'test';

    // Use DATABASE_URL if set, otherwise use local MongoDB at default port.
    // Avoid mongodb-memory-server download to keep the smoke test fast.
    const mongoUri = process.env.DATABASE_URL || 'mongodb://127.0.0.1:27017/lightstorm_test';
    process.env.DATABASE_URL = mongoUri;

    // Now require the app (this triggers mongoose.connect inside app.js)
    const app = require('../src/app');
    const request = supertest(app);

    // Helper to fetch ethereal preview HTML from getTestMessageUrl
    const https = require('https');
    const { URL } = require('url');
    async function fetchPreview(url) {
      return new Promise((resolve, reject) => {
        const u = new URL(url);
        const get = u.protocol === 'https:' ? require('https').get : require('http').get;
        get(url, (res) => {
          let data = '';
          res.on('data', (chunk) => data += chunk.toString());
          res.on('end', () => resolve(data));
        }).on('error', reject);
      });
    }

    console.log('Running register -> verify -> forgot -> reset smoke test');

    const testEmail = `local.test+${Date.now()}@example.com`;

    // 1) Register
    const regResp = await request.post('/api/users/register').send({ username: 'LocalTester', email: testEmail, password: 'Pass12345!' });
    console.log('Register status:', regResp.status, regResp.body.message || '');
    if (regResp.status !== 201) throw new Error('Register failed');

    // Wait for email to be sent and captured
    if (!lastSentInfo) {
      // small wait loop
      for (let i = 0; i < 10 && !lastSentInfo; i++) await new Promise(r => setTimeout(r, 200));
    }
    if (!lastSentInfo) throw new Error('Verification email not captured');

    const previewUrl = nodemailer.getTestMessageUrl(lastSentInfo);
    console.log('Preview URL (verification):', previewUrl);
    const html = await fetchPreview(previewUrl);
    const tokenMatch = html.match(/verify-email\?token=([0-9a-fA-F]+)/) || html.match(/verify%2Demail\%3Ftoken%3D([0-9a-fA-F]+)/);
    if (!tokenMatch) throw new Error('Verification token not found in email HTML');
    const verificationToken = tokenMatch[1];
    console.log('Extracted verification token:', verificationToken);

    // 2) Verify via POST
    const verifyResp = await request.post('/api/users/verify-email').send({ token: verificationToken });
    console.log('Verify status:', verifyResp.status, verifyResp.body.message || '');
    if (verifyResp.status !== 200) throw new Error('Verification failed');

    // 3) Forgot password (should send reset email)
    lastSentInfo = null;
    const forgotResp = await request.post('/api/users/forgot-password').send({ email: testEmail });
    console.log('Forgot status:', forgotResp.status, forgotResp.body.message || '');
    if (forgotResp.status !== 200) throw new Error('Forgot-password call failed');

    // Wait for reset email
    if (!lastSentInfo) {
      for (let i = 0; i < 10 && !lastSentInfo; i++) await new Promise(r => setTimeout(r, 200));
    }
    if (!lastSentInfo) throw new Error('Reset email not captured');

    const resetPreviewUrl = nodemailer.getTestMessageUrl(lastSentInfo);
    console.log('Preview URL (reset):', resetPreviewUrl);
    const resetHtml = await fetchPreview(resetPreviewUrl);
    const resetTokenMatch = resetHtml.match(/reset-password\?token=([0-9a-fA-F]+)/) || resetHtml.match(/reset%2Dpassword\%3Ftoken%3D([0-9a-fA-F]+)/);
    if (!resetTokenMatch) throw new Error('Reset token not found in email HTML');
    const resetToken = resetTokenMatch[1];
    console.log('Extracted reset token:', resetToken);

    // 4) Reset password
    const newPassword = 'NewPass123!';
    const resetResp = await request.post('/api/users/reset-password').send({ token: resetToken, password: newPassword });
    console.log('Reset status:', resetResp.status, resetResp.body.message || '');
    if (resetResp.status !== 200) throw new Error('Reset password failed');

    console.log('Smoke test completed successfully');

    // Cleanup
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Smoke test failed:', err);
    process.exit(2);
  }
})();
