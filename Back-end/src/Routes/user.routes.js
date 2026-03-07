const express = require("express");
const Router = express.Router();
const UserController = require("../Controllers/user.controller");
const multerConfig = require("../Middlewares/multer");

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
