const express = require('express');
const path = require('path');
const fs = require('fs');

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
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests, please try again later.'
  }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many login attempts, please try again later.'
  }
});
app.use("/api/users/login", authLimiter);
app.use("/api", limiter);
const resetLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 5 });
app.use("/api/users/forgot-password", resetLimiter);
app.use("/api/users/reset-password", resetLimiter);

// Middleware
app.use(helmet());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const allowedOrigins = [
  "http://localhost:4200",
  "http://localhost:7000",
  "https://lightstorm-ecommerce.vercel.app",
  "https://lightstormtechnologies.com",
  "https://www.lightstormtechnologies.com",
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  credentials: true,
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. server-to-server, curl)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: origin '${origin}' not allowed`));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['set-cookie']
}));
app.options('*', cors());
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

app.get('/ping', (req, res) => {
  res.status(200).type('text/plain').send('ok');
});

// Health check endpoint for deployment verification
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// Serve static files ONLY if the dist folder exists (not needed when frontend is on Vercel)
const frontendPath = path.join(__dirname, '../../Front-end/dist/lightstorm-ecommerce/browser');
if (fs.existsSync(frontendPath)) {
  app.use(express.static(frontendPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
}



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
