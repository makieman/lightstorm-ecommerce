const express = require("express");
const Router = express.Router();
const jwt = require('jsonwebtoken');
const UserController = require("../Controllers/user.controller");
const multerConfig = require("../Middlewares/multer");
const passport = require('../services/passport.service');

// ─── Specific named routes FIRST (before /:id wildcards) ───────────────
Router.get("/", UserController.GetAllUsers);
Router.post("/login", UserController.LoginUser);
Router.post("/register", UserController.RegisterUser);
Router.post("/verify-email", UserController.VerifyEmail);
Router.get("/verify/:token", UserController.VerifyEmailGET);
Router.post("/resend-verification", UserController.ResendVerificationEmail);
Router.post("/forgot-password", UserController.ForgotPassword);
Router.post("/reset-password", UserController.ResetPassword);
Router.get("/user/user", UserController.GetUserByToken);
Router.post("/user/logout", UserController.userLogout);
Router.put("/cart/decrease", UserController.DecreaseProductQuantity);
Router.put("/cart/increase", UserController.IncreaseProductQuantity);
Router.delete("/cart/remove", UserController.RemoveProductFromCart);

// Step 1 - redirect user to Google login
Router.get('/auth/google',
	passport.authenticate('google', {
		scope: ['profile', 'email']
	})
);

// Step 2 - Google redirects back here after login
Router.get('/auth/google/callback',
	(req, res, next) => {
		passport.authenticate('google', { session: true }, async (err, user) => {
			if (err) {
				const oauthData = err?.oauthError?.data?.toString?.() || '';
				const normalized = `${err.message || ''} ${oauthData}`.toLowerCase();

				let errorCode = 'google_failed';
				if (normalized.includes('invalid_client') || normalized.includes('unauthorized')) {
					errorCode = 'google_invalid_client';
				} else if (normalized.includes('redirect_uri_mismatch')) {
					errorCode = 'google_redirect_mismatch';
				}

				console.error('Google callback token exchange failed:', {
					message: err.message,
					oauthData,
					errorCode
				});

				return res.redirect(`${process.env.APP_URL}/login?error=${errorCode}`);
			}

			if (!user) {
				return res.redirect(`${process.env.APP_URL}/login?error=google_failed`);
			}

			req.logIn(user, { session: true }, (loginErr) => {
				if (loginErr) {
					console.error('Google callback session login error:', loginErr);
					return res.redirect(`${process.env.APP_URL}/login?error=session_error`);
				}

				try {
					const token = jwt.sign(
						{ _id: user._id },
						process.env.JWT_SECRET,
						{ expiresIn: '7d' }
					);

					res.cookie('jwt', token, {
						httpOnly: true,
						secure: process.env.NODE_ENV === 'production',
						sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
						maxAge: 7 * 24 * 60 * 60 * 1000,
						path: '/'
					});

					return res.redirect(`${process.env.APP_URL}/home?google=success`);
				} catch (error) {
					console.error('Google callback error:', error);
					return res.redirect(`${process.env.APP_URL}/login?error=server_error`);
				}
			});
		})(req, res, next);
	}
);

// ─── Parameterized routes LAST ──────────────────────────────────────────
Router.post("/", multerConfig, UserController.AddNewUser);
Router.get("/:id", UserController.GetUserById);
Router.put("/:id", multerConfig, UserController.UpdateUser);
Router.delete("/:id", UserController.DeleteUser);
Router.get("/:id/cart", UserController.GetCartByUserId);
Router.get("/:id/orders", UserController.GetOrdersByUserId);
Router.post("/:id/cart", UserController.AddProductToCart);
Router.post("/:id/order", UserController.AddProductToOrder);

module.exports = Router;
