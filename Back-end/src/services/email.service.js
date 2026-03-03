const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

const sendVerificationEmail = async (email, token) => {
    const baseUrl = process.env.APP_URL || "http://localhost:4200";
    const link = `${baseUrl}/verify-email?token=${token}`;

    try {
        await transporter.sendMail({
            from: `"Lightstorm Ecommerce" <${process.env.SMTP_USER}>`,
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
        });
        console.log(`Verification email successfully sent to ${email}`);
    } catch (error) {
        console.error(`Failed to send verification email to ${email}:`, error);
        throw error;
    }
};

module.exports = { sendVerificationEmail };
