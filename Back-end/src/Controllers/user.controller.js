// ---------------------------------- All Requires -------------------------------------
const UserModel = require("../Models/user.model");
const OrderModel = require("../Models/order.model");
const ProductModel = require("../Models/product.model");
const UserValidate = require("../Middlewares/user.validation");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const cloudUpload = require("../services/cloudinary.service");
const { sendVerificationEmail, sendPasswordResetEmail } = require("../services/email.service");
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error("JWT_SECRET env var is required");
const COOKIE_OPTIONS = ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
});

function formatAjvErrors(errors) {
  if (!errors) return "Invalid input";
  return errors.map(e => `${e.instancePath || '/'} ${e.message}`).join(', ');
}

// ---------------------------------- Get All Users  ------------------------------------
let GetAllUsers = async (req, res) => {
  // => for testing routes
  try {
    let users = await UserModel.find({});
    if (!users) return res.json({ message: "No Users Found" });
    return res.json(users);
  } catch (err) {
    return res.json(err);
  }
};
// ---------------------------------- Get User By ID  -----------------------------------
let GetUserById = async (req, res) => {
  try {
    let user = await UserModel.findById(req.params.id);
    if (!user) return res.json({ message: "No User Found" });
    return res.json(user);
  } catch (err) {
    return res.json(err);
  }
};
// ---------------------------------- Add New User  -------------------------------------
let AddNewUser = async (req, res) => {
  try {
    const valid = UserValidate(req.body);
    if (!valid) return res.status(400).send({ message: formatAjvErrors(UserValidate.errors) });

    const salt = await bcrypt.genSalt(10);
    const password = req.body.password;
    const hashedPassword = await bcrypt.hash(password, salt);

    let imageUrl = req.body.image;
    if (req.files && req.files[0]) {
      const uploadedImage = await cloudUpload(req.files[0].path);
      imageUrl = uploadedImage.url;
    }

    const user = new UserModel({
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword,
      image: imageUrl,
    });
    await user.save();
    return res.status(201).json({ message: "User Added Successfully", user: { id: user._id, email: user.email, username: user.username } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
};
// ---------------------------------- Update User By ID  --------------------------------
const UpdateUser = async (req, res) => {
  const id = req.params.id;
  const user = await UserModel.findById(id);
  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }
  if (req.body.password) {
    try {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);
      user.password = hashedPassword;
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Error hashing password", error: error.message });
    }
  }
  if (req.files && req.files[0] !== undefined) {
    let uploadedImage = await cloudUpload(req.files[0].path);
    user.image = uploadedImage.url;
  }

  if (req.body.orders) {
    user.orders = req.body.orders
  }

  try {
    const updatedUser = await UserModel.findByIdAndUpdate(
      id,
      { $set: user },
      { new: true }
    );

    if (user.username !== req.body.username) {
      const updateResult = await OrderModel.updateMany(
        { userId: id },
        { $set: { username: req.body.username } }
      );
    }

    return res.json(updatedUser);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error updating user", error: error.message });
  }
};

// ---------------------------------- Delete User By ID  ---------------------------------
let DeleteUser = async (req, res) => {
  try {
    let user = await UserModel.findByIdAndDelete(req.params.id);
    if (!user) return res.json({ message: "No User Found" });
    return res.json({ message: "User Deleted Successfully" });
  } catch (err) {
    return res.json(err);
  }
};
// ---------------------------------- Login User  ---------------------------------------
let LoginUser = async (req, res) => {
  const user = await UserModel.findOne({ email: req.body.email });
  if (!user) {
    return res.status(400).send({ message: "Invalid Email or Password" });
  }
  // Allow admin to login even without email verification
  if (!user.isVerified && !user.isAdmin) {
    return res.status(401).send({ message: "Please verify your email before logging in" });
  }
  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) {
    return res.status(400).send({ message: "Invalid Email or Password" });
  }
  const { _id } = user.toJSON();
  const token = jwt.sign({ _id: _id }, JWT_SECRET, { expiresIn: '7d' });
  res.cookie("jwt", token, COOKIE_OPTIONS);
  return res
    .status(200)
    .json({ message: "User Logged In Successfully", user: user });
};
// ---------------------------------- Register User  ------------------------------------
let RegisterUser = async (req, res) => {
  const valid = UserValidate(req.body);
  if (!valid) return res.status(400).json({ message: formatAjvErrors(UserValidate.errors) });

  try {
    const name = req.body.username;
    const email = req.body.email;
    const password = req.body.password;

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const checkUser = await UserModel.findOne({ email: email });
    if (checkUser) {
      return res.status(400).json({ message: "User Already Exists" });
    }

    const verificationToken = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const newUser = new UserModel({
      username: name,
      email: email,
      password: hashedPassword,
      verificationToken: verificationToken,
      verificationTokenExpiry: expiry,
      isVerified: false,
    });
    const savedUser = await newUser.save();

    // Send verification email but don't let email failure crash registration
    let emailSent = true;
    try {
      await sendVerificationEmail(email, verificationToken);
    } catch (emailErr) {
      console.error("Verification email failed (user still created):", emailErr.message);
      emailSent = false;
    }

    return res
      .status(201)
      .json({
        message: emailSent
          ? "User Created Successfully. Check your email to activate account."
          : "User Created Successfully. Email sending failed — use 'Resend Verification' to get your activation link.",
        user: { id: savedUser._id, email: savedUser.email },
        emailSent,
      });
  } catch (error) {
    if (error && error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'Email already registered'
      });
    }
    return res.status(500).json({ message: error.message });
  }
};

// Verify email token and activate account
const VerifyEmail = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ message: "Token is required" });

    const user = await UserModel.findOne({ verificationToken: token });
    if (!user || !user.verificationTokenExpiry || user.verificationTokenExpiry < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    user.isVerified = true;
    user.verificationToken = null;
    user.verificationTokenExpiry = null;
    await user.save();

    const { _id } = user.toJSON();
    const jwtToken = jwt.sign({ _id: _id }, JWT_SECRET, { expiresIn: '7d' });
    res.cookie('jwt', jwtToken, COOKIE_OPTIONS);
    return res.status(200).json({ message: 'Email verified and user logged in', user: { id: user._id, email: user.email } });
  } catch (error) {
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Verify email token via GET request
const VerifyEmailGET = async (req, res) => {
  try {
    const token = req.params.token;
    if (!token) return res.status(400).send("Token is required");

    const user = await UserModel.findOne({ verificationToken: token });
    if (!user || !user.verificationTokenExpiry || user.verificationTokenExpiry < Date.now()) {
      return res.status(400).send("Invalid or expired token.");
    }

    user.isVerified = true;
    user.verificationToken = null;
    user.verificationTokenExpiry = null;
    await user.save();

    const { _id } = user.toJSON();
    const jwtToken = jwt.sign({ _id: _id }, JWT_SECRET, { expiresIn: '7d' });
    res.cookie('jwt', jwtToken, COOKIE_OPTIONS);

    const baseUrl = process.env.APP_URL || "http://localhost:4200";
    return res.redirect(`${baseUrl}/login?verified=true`);
  } catch (error) {
    return res.status(500).send('Internal Server Error');
  }
};

const ResendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await UserModel.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.isVerified) return res.status(400).json({ message: "User already verified" });

    // Generate new token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    user.verificationToken = verificationToken;
    user.verificationTokenExpiry = expiry;
    await user.save();

    await sendVerificationEmail(email, verificationToken);

    return res.status(200).json({ message: "Verification email sent successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ------------------------ Forgot Password -------------------------
const ForgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await UserModel.findOne({ email });
    if (user) {
      const token = crypto.randomBytes(32).toString('hex');
      const hashed = crypto.createHash('sha256').update(token).digest('hex');
      user.passwordResetToken = hashed;
      user.passwordResetTokenExpiry = Date.now() + 60 * 60 * 1000; // 1 hour
      await user.save();
      try {
        await sendPasswordResetEmail(email, token);
      } catch (err) {
        console.error('Failed sending password reset email', err);
      }
    }

    // Always return 200 to avoid account enumeration
    return res.status(200).json({ message: 'If an account exists, a reset link will be sent to the email provided.' });
  } catch (error) {
    console.error('ForgotPassword error', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

// ------------------------ Reset Password -------------------------
const ResetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ message: 'Token and password are required' });

    const hashed = crypto.createHash('sha256').update(token).digest('hex');
    const user = await UserModel.findOne({ passwordResetToken: hashed, passwordResetTokenExpiry: { $gt: Date.now() } });
    if (!user) return res.status(400).json({ message: 'Invalid or expired token' });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.passwordResetToken = null;
    user.passwordResetTokenExpiry = null;
    user.passwordChangedAt = Date.now();
    await user.save();

    return res.status(200).json({ message: 'Password has been reset successfully' });
  } catch (error) {
    console.error('ResetPassword error', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};
// ---------------------------------- Add Product To Cart ------------------------
let AddProductToCart = async (req, res) => {
  const { user_id, product, quantity } = req.body;

  try {
    const user = await UserModel.findById(user_id);
    const productt = await ProductModel.findById(product);

    if (!user || !productt) {
      return res.status(404).json({ message: "User or product not found" });
    }

    const existingItemIndex = user.carts.findIndex(
      (item) => item.product.toString() === product.toString()
    );

    if (existingItemIndex !== -1) {
      const newQuantity = user.carts[existingItemIndex].quantity + quantity;
      if (newQuantity > productt.quantity) {
        return res.status(400).json({ message: "Quantity exceeds stock" });
      } else {
        user.carts[existingItemIndex].quantity = newQuantity;
        productt.quantity -= quantity;
        await productt.save();
      }
    } else {
      if (quantity > productt.quantity) {
        return res.status(400).json({ message: "Quantity exceeds stock" });
      } else {
        user.carts.push({ product: product, quantity: quantity });
        productt.quantity -= quantity;
        await productt.save();
      }
    }

    await user.save();
    const { password, ...userData } = user.toObject();
    return res
      .status(201)
      .json({ message: "Item added to cart successfully", user: userData });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Add products to order
 */
let AddProductToOrder = async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await UserModel.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const productIds = user.carts.map(item => item.product);
    const products = await ProductModel.find({ _id: { $in: productIds } });

    let totalPrice = 0;
    user.carts.forEach(item => {
      const product = products.find(p => p._id.toString() === item.product.toString());
      if (product) {
        totalPrice += product.price * item.quantity;
      }
    });
    totalPrice += 300;

    const orderProducts = user.carts.map(item => item.product);

    user.carts = [];

    await user.save();

    const order = new OrderModel({
      userId: user._id,
      username: user.username,
      date: new Date(),
      totalPrice: totalPrice,
      products: orderProducts,
      status: "Pending"
    });

    await order.save();
    user.orders.push(order._id);
    await user.save();

    res.status(200).json({ message: "Products added to order successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// ---------------------------------- Remove Product From Cart ------------------------
let RemoveProductFromCart = async (req, res) => {
  const { userid, productid } = req.body;

  try {
    const user = await UserModel.findById(userid);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const cartItem = user.carts.find(
      (item) => item.product.toString() === productid
    );
    if (!cartItem) {
      return res
        .status(404)
        .json({ message: "Product not found in user's cart" });
    }

    const CartItemQunatity = cartItem.quantity;

    user.carts = user.carts.filter(
      (item) => item.product.toString() !== productid
    );
    await user.save();

    const product = await ProductModel.findById(productid);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    product.quantity += CartItemQunatity;
    await product.save();

    res.status(200).json({ message: "Product removed from cart successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
// ---------------------------------- Update Product Quantity ------------------------
let IncreaseProductQuantity = async (req, res) => {
  const { userid, productid } = req.body;

  try {
    const user = await UserModel.findById(userid);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const cartItem = user.carts.find(
      (item) => item.product.toString() === productid
    );
    if (!cartItem) {
      return res
        .status(404)
        .json({ message: "Product not found in user's cart" });
    }

    cartItem.quantity += 1;
    await user.save();

    const product = await ProductModel.findById(productid);
    if (!product || product.quantity == 0) {
      return res
        .status(404)
        .json({ message: "Product not found or out of stock" });
    }
    product.quantity -= 1;
    await product.save();

    res
      .status(200)
      .json({ message: "Product quantity increased successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

let DecreaseProductQuantity = async (req, res) => {
  const { userid, productid } = req.body;

  try {
    const user = await UserModel.findById(userid);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const cartItem = user.carts.find(
      (item) => item.product.toString() === productid
    );
    if (!cartItem) {
      return res
        .status(404)
        .json({ message: "Product not found in user's cart" });
    }

    if (cartItem.quantity !== 1) {
      cartItem.quantity -= 1;
    }
    await user.save();

    const product = await ProductModel.findById(productid);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    product.quantity += 1;
    await product.save();

    res
      .status(200)
      .json({ message: "Product quantity decreased successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// ---------------------------------- Get Cart By User ID ------------------------
let GetCartByUserId = async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await UserModel.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ cart: user.carts });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

let GetOrdersByUserId = async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await UserModel.findById(userId).populate("orders");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ orders: user.orders });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const GetUserByToken = async (req, res) => {
  try {
    const cookie = req.cookies["jwt"];
    if (!cookie) {
      // console.log("JWT cookie not found")
      return res
        .status(401)
        .json({ message: "Unauthorized: JWT cookie not found" });
    }
    const claims = jwt.verify(cookie, JWT_SECRET);
    if (!claims) {
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }
    const user = await UserModel.findOne({ _id: claims._id });
    if (!user) {
      return res.status(401).json({ message: "Unauthorized: User not found" });
    }

    const { isTokenInvalidatedByPasswordChange } = require('../Utils/auth.utils');
    if (isTokenInvalidatedByPasswordChange(claims, user)) {
      return res.status(401).json({ message: 'Unauthorized: Token invalidated due to password change.' });
    }

    const { password, ...data } = user.toJSON();
    return res.json({ data: data });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const userLogout = async (req, res) => {
  try {
    const cookie = req.cookies["jwt"];
    const clearCookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    };

    if (cookie) {
      return res
        .clearCookie("jwt", clearCookieOptions)
        .status(200)
        .json({ success: true, message: "Logout successful" });
    } else {
      return res
        .clearCookie("jwt", clearCookieOptions)
        .status(200)
        .json({ success: true, message: "No JWT cookie found" });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// ---------------------------------- Export All Functions  ------------------------------
module.exports = {
  GetAllUsers,
  GetUserById,
  AddNewUser,
  UpdateUser,
  DeleteUser,
  LoginUser,
  RegisterUser,
  AddProductToCart,
  RemoveProductFromCart,
  IncreaseProductQuantity,
  DecreaseProductQuantity,
  GetCartByUserId,
  GetOrdersByUserId,
  AddProductToOrder,
  GetUserByToken,
  userLogout,
  VerifyEmail,
  VerifyEmailGET,
  ResendVerificationEmail,
  ForgotPassword,
  ResetPassword,
};
// ---------------------------------- End Of Controller ----------------------------------
