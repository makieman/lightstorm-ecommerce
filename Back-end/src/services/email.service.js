const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

const APP_URL = process.env.APP_URL || 'http://localhost:4200';
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@lightstormtechnologies.com';

const sendVerificationEmail = async (email, token) => {
  // Use Render's default URL env var or fallback to local
  const BACKEND_URL = process.env.BACKEND_URL || process.env.RENDER_EXTERNAL_URL || `http://localhost:${process.env.PORT || 7000}`;
  
  // Directly hit the GET route on the backend which verifies and redirects
  const verificationUrl = `${BACKEND_URL}/api/users/verify/${token}`;
  
  await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: 'Verify your Lightstorm account',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #e63946; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">⚡ Lightstorm</h1>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <h2>Verify Your Email Address</h2>
          <p>Thank you for registering! Click the button below to activate your account.</p>
          <a href="${verificationUrl}" 
             style="display: inline-block; background: #e63946; color: white; 
                    padding: 12px 30px; border-radius: 6px; text-decoration: none;
                    font-size: 16px; margin: 20px 0;">
            Verify Email
          </a>
          <p style="color: #666; font-size: 14px;">
            This link expires in 24 hours.<br>
            If you didn't create an account, ignore this email.
          </p>
        </div>
      </div>
    `
  });
};

const sendPasswordResetEmail = async (email, token) => {
  const resetUrl = `${APP_URL}/reset-password?token=${token}`;
  
  await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: 'Reset your Lightstorm password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #e63946; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">⚡ Lightstorm</h1>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <h2>Reset Your Password</h2>
          <p>Click below to reset your password. This link expires in 1 hour.</p>
          <a href="${resetUrl}"
             style="display: inline-block; background: #e63946; color: white;
                    padding: 12px 30px; border-radius: 6px; text-decoration: none;
                    font-size: 16px; margin: 20px 0;">
            Reset Password
          </a>
          <p style="color: #666; font-size: 14px;">
            If you didn't request this, ignore this email.
          </p>
        </div>
      </div>
    `
  });
};

module.exports = { sendVerificationEmail, sendPasswordResetEmail };
