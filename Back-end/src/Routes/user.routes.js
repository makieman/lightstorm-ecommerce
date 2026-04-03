const express = require("express");
const Router = express.Router();
const jwt = require('jsonwebtoken');
const UserController = require("../Controllers/user.controller");
const multerConfig = require("../Middlewares/multer");
const passport = require('../services/passport.service');
const requireAuth = require("../Middlewares/auth.middleware");
const adminAuthenticate = require("../Middlewares/admin.middleware");

// ─── Specific named routes FIRST (before /:id wildcards) ───────────────
Router.get("/", adminAuthenticate, UserController.GetAllUsers);
Router.post("/login", UserController.LoginUser);
Router.post("/register", UserController.RegisterUser);
Router.post("/verify-email", UserController.VerifyEmail);
Router.get("/verify/:token", UserController.VerifyEmailGET);
Router.post("/resend-verification", UserController.ResendVerificationEmail);
Router.post("/forgot-password", UserController.ForgotPassword);
Router.post("/reset-password", UserController.ResetPassword);
Router.get("/user/user", UserController.GetUserByToken);
Router.post("/user/logout", UserController.userLogout);
Router.put("/cart/decrease", requireAuth, UserController.DecreaseProductQuantity);
Router.put("/cart/increase", requireAuth, UserController.IncreaseProductQuantity);
Router.delete("/cart/remove", requireAuth, UserController.RemoveProductFromCart);

// Step 1 - redirect user to Google login
Router.get('/auth/google',
	passport.authenticate('google', {
		scope: ['profile', 'email']
	})
);

// Step 2 - Google redirects back here after login
Router.get('/auth/google/callback',
  (req, res, next) => {
    passport.authenticate('google', (err, user, info) => {
      if (err) {
        console.error('Google OAuth error:', err);
        return res.redirect(
          `${process.env.APP_URL}/login?error=google_invalid_client&detail=${err.message}`
        );
      }
      if (!user) {
        console.error('Google OAuth no user:', info);
        return res.redirect(
          `${process.env.APP_URL}/login?error=google_no_user`
        );
      }
      req.logIn(user, async (loginErr) => {
        if (loginErr) {
          console.error('Login error:', loginErr);
          return res.redirect(
            `${process.env.APP_URL}/login?error=login_failed`
          );
        }
        try {
          const jwt = require('jsonwebtoken');
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
            path: '/',
            domain: process.env.NODE_ENV === "production" ? '.lightstormtechnologies.com' : undefined 
          });
          return res.redirect(`${process.env.APP_URL}/home?google=success`);
        } catch (error) {
          console.error('Token error:', error);
          return res.redirect(
            `${process.env.APP_URL}/login?error=token_failed`
          );
        }
      });
    })(req, res, next);
  }
);

// ─── Parameterized routes LAST ──────────────────────────────────────────
Router.post("/", adminAuthenticate, multerConfig, UserController.AddNewUser);

// Protected user routes - require authentication
Router.get("/:id", requireAuth, UserController.GetUserById);
Router.put("/:id", requireAuth, multerConfig, UserController.UpdateUser);
Router.delete("/:id", adminAuthenticate, UserController.DeleteUser);
Router.get("/:id/cart", requireAuth, UserController.GetCartByUserId);
Router.get("/:id/orders", requireAuth, UserController.GetOrdersByUserId);
Router.post("/:id/cart", requireAuth, UserController.AddProductToCart);
Router.post("/:id/order", requireAuth, UserController.AddProductToOrder);

module.exports = Router;
