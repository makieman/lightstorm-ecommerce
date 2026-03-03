const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
require('dotenv').config();

const userRoutes = require('./Routes/user.routes');
const productRoutes = require('./Routes/product.routes');
const orderRoutes = require('./Routes/order.routes');
const aiRoutes = require('./Routes/ai.routes');
const adminRoutes = require('./Routes/admin.routes');

const app = express();

const rateLimit = require("express-rate-limit");
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10 });
app.use("/api/users/login", authLimiter);
app.use("/api/users/register", authLimiter);
app.use("/api/users/resend-verification", authLimiter);

// Middleware
app.use(helmet());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const allowedOrigins = [
  "http://localhost:4200",
  "http://localhost:7000",
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  credentials: true,
  origin: allowedOrigins
}));
app.use(cookieParser());

// Database connection

const DATABASE_URL = process.env.DATABASE_URL;
mongoose
  .connect(DATABASE_URL)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });

// Routes
app.use("/api/users", userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/admin', adminRoutes);


// Error handling
app.use((err, req, res, next) => {
  console.error('API ERROR:', err);

  if (req.originalUrl && req.originalUrl.startsWith('/api')) {
    return res.status(500).json({
      message: 'Internal Server Error',
      error: err.message,
      stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
    });
  }

  res.status(500).type('text/plain').send('Internal Server Error');
});

module.exports = app;
