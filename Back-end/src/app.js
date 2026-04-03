const express = require('express');
const path = require('path');
const fs = require('fs');

const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const session = require('express-session');
require('dotenv').config();

const userRoutes = require('./Routes/user.routes');
const productRoutes = require('./Routes/product.routes');
const orderRoutes = require('./Routes/order.routes');
const aiRoutes = require('./Routes/ai.routes');
const adminRoutes = require('./Routes/admin.routes');
const paymentRoutes = require('./Routes/payment.routes');
const bannerRoutes = require('./Routes/banner.routes');
const passport = require('./services/passport.service');

const app = express();

// Keep-alive ping — must be FIRST, before all middleware
// to guarantee minimal response size (cron-job.org has 64KB limit)
app.get('/ping', (req, res) => res.status(200).type('text/plain').send('ok'));

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

const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, error: 'Too many payment attempts, please try again later.' }
});
app.use("/api/payments/stkpush", paymentLimiter);

const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { success: false, error: 'Too many registration attempts, please try again later.' }
});
app.use("/api/users/register", registerLimiter);

// Middleware
app.use(helmet());
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
app.use(bodyParser.json({ limit: '10mb' }));

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
app.set('trust proxy', 1);
app.use(session({
  secret: process.env.SESSION_SECRET || process.env.JWT_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 24 * 60 * 60 * 1000,
    proxy: true
  }
}));
app.use(passport.initialize());
app.use(passport.session());

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
app.use('/api/payments', paymentRoutes);
app.use('/api/banners', bannerRoutes);

// /ping is defined at top of file before all middleware

// Health check endpoint for deployment verification
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// Development-only auth debug endpoint to verify passport session state.
app.get('/api/auth/debug-session', (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({ message: 'Not found' });
  }

  const safeUser = req.user
    ? {
        _id: req.user._id,
        email: req.user.email,
        username: req.user.username,
        googleId: req.user.googleId || null,
        isVerified: Boolean(req.user.isVerified)
      }
    : null;

  return res.status(200).json({
    authenticated: typeof req.isAuthenticated === 'function' ? req.isAuthenticated() : false,
    user: safeUser,
    hasSession: Boolean(req.session),
    sessionID: req.sessionID || null,
    passportSession: req.session?.passport || null,
    cookie: {
      secure: req.session?.cookie?.secure,
      sameSite: req.session?.cookie?.sameSite,
      expires: req.session?.cookie?.expires || null,
      maxAge: req.session?.cookie?.maxAge || null
    }
  });
});

// Serve static files ONLY if the dist folder exists (not needed when frontend is on Vercel)
const frontendPath = path.join(__dirname, '../../Front-end/dist/lightstorm-ecommerce/browser');
if (fs.existsSync(frontendPath)) {
  app.use(express.static(frontendPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
}



// 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('API ERROR:', err.message);

  if (req.originalUrl && req.originalUrl.startsWith('/api')) {
    return res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === 'production'
        ? 'Something went wrong'
        : err.message
    });
  }

  res.status(500).type('text/plain').send('Internal Server Error');
});

module.exports = app;
