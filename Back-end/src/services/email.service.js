const nodemailer = require("nodemailer");

let transporter = null;
let usingEthereal = false;

async function initTransporter() {
    if (transporter) return transporter;

    const hasSmtp = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS && process.env.SMTP_PORT;
    if (hasSmtp) {
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT),
            secure: Number(process.env.SMTP_PORT) === 465,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
        usingEthereal = false;
        return transporter;
    }

    // Fallback: create an Ethereal test account so local dev can preview emails
    try {
        const testAccount = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({
            host: testAccount.smtp.host,
            port: testAccount.smtp.port,
            secure: testAccount.smtp.secure,
            auth: { user: testAccount.user, pass: testAccount.pass },
        });
        usingEthereal = true;
        console.log('No SMTP config found — using Ethereal test account for email previews.');
        return transporter;
    } catch (err) {
        // Final fallback: console logger transporter
        transporter = {
            sendMail: async (mailOptions) => {
                console.log('=== Email (console fallback) ===');
                console.log('To:', mailOptions.to);
                console.log('Subject:', mailOptions.subject);
                console.log('HTML:', mailOptions.html);
                console.log('=== End Email ===');
                return { accepted: [mailOptions.to] };
            },
        };
        usingEthereal = false;
        return transporter;
    }
}

const sendVerificationEmail = async (email, token) => {
    const baseUrl = process.env.APP_URL || "http://localhost:4200";
    const link = `${baseUrl}/verify-email?token=${token}`;
    const mail = {
        from: `"Lightstorm Ecommerce" <${process.env.SMTP_USER || 'no-reply@example.com'}>`,
        to: email,
        subject: "Verify your email for Lightstorm",
        html: `
            <h2>Welcome to Lightstorm!</h2>
            <p>Thank you for registering. Please click the link below to verify your email address:</p>
            <a href="${link}" style="display:inline-block;padding:10px 20px;background-color:#007bff;color:#ffffff;text-decoration:none;border-radius:5px;">Verify Email</a>
            <p>Or copy and paste this link in your browser:</p>
            <p><a href="${link}">${link}</a></p>
            <p>This link will expire in 24 hours.</p>
        `,
    };

    const t = await initTransporter();
    try {
        const info = await t.sendMail(mail);
        console.log(`Verification email processed for ${email}`);
        if (usingEthereal && info) {
            const url = nodemailer.getTestMessageUrl(info);
            if (url) console.log(`Preview URL: ${url}`);
        }
        return info;
    } catch (error) {
        console.error(`Failed to send verification email to ${email}:`, error);
        throw error;
    }
};

const sendPasswordResetEmail = async (email, token) => {
    const baseUrl = process.env.APP_URL || "http://localhost:4200";
    const link = `${baseUrl}/reset-password?token=${token}`;
    const mail = {
        from: `"Lightstorm Ecommerce" <${process.env.SMTP_USER || 'no-reply@example.com'}>`,
        to: email,
        subject: "Reset your Lightstorm password",
        html: `
            <h2>Password reset request</h2>
            <p>We received a request to reset your password. Click the link below to set a new password (valid for 1 hour):</p>
            <a href="${link}" style="display:inline-block;padding:10px 20px;background-color:#dc2626;color:#ffffff;text-decoration:none;border-radius:5px;">Reset Password</a>
            <p>Or copy and paste this link in your browser:</p>
            <p><a href="${link}">${link}</a></p>
            <p>If you did not request this, you can safely ignore this email.</p>
        `,
    };

    const t = await initTransporter();
    try {
        const info = await t.sendMail(mail);
        console.log(`Password reset email processed for ${email}`);
        if (usingEthereal && info) {
            const url = nodemailer.getTestMessageUrl(info);
            if (url) console.log(`Preview URL: ${url}`);
        }
        return info;
    } catch (error) {
        console.error(`Failed to send password reset email to ${email}:`, error);
        throw error;
    }
};

module.exports = { sendVerificationEmail, sendPasswordResetEmail };
