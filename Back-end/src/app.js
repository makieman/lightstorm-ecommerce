const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const userRoutes = require('./Routes/user.routes');
const productRoutes = require('./Routes/product.routes');
const orderRoutes = require('./Routes/order.routes');

const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors({
  credentials: true,
  origin: ["http://localhost:4200", "http://localhost:7000"]
}));
app.use(cookieParser());

// Database connection
console.log('DB URL:', process.env.DATABASE_URL);

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

// Static files
const resolveStaticDir = (candidates, requiredFile) => {
  for (const candidate of candidates) {
    const resolved = path.resolve(candidate);
    if (requiredFile) {
      if (fs.existsSync(path.join(resolved, requiredFile))) return resolved;
    } else {
      if (fs.existsSync(resolved)) return resolved;
    }
  }
  return path.resolve(candidates[0]);
};

const angularDistPath = resolveStaticDir(
  [
    path.join(__dirname, '../../Front-end/dist/lightstorm-ecommerce/browser'),
    path.join(__dirname, '../../../Front-end/dist/lightstorm-ecommerce/browser'),
    path.join(process.cwd(), 'Front-end/dist/lightstorm-ecommerce/browser'),
    path.join(process.cwd(), '../Front-end/dist/lightstorm-ecommerce/browser')
  ],
  'index.html'
);

const landingPagePath = resolveStaticDir(
  [
    path.join(__dirname, '../../landing-page'),
    path.join(__dirname, '../../../landing-page'),
    path.join(process.cwd(), 'landing-page'),
    path.join(process.cwd(), '../landing-page')
  ],
  'index.html'
);

console.log('Resolved landingPagePath:', landingPagePath);
console.log('Landing page index.html exists:', fs.existsSync(path.join(landingPagePath, 'index.html')));

// Serve Angular app at /shop
app.use('/shop', express.static(angularDistPath));

// Serve Landing page at root
app.use(express.static(landingPagePath));

// Catch-all for Angular routing
app.get('/shop/*', (req, res) => {
  res.sendFile(path.join(angularDistPath, 'index.html'), (err) => {
    if (!err) return;
    console.error('Failed to serve Angular index.html:', err.message);
    res.status(500).type('text/plain').send('Internal Server Error');
  });
});

// Catch-all for Landing page navigation
app.get('*', (req, res, next) => {
  if (req.url.startsWith('/api')) return next();
  res.sendFile(path.join(landingPagePath, 'index.html'), (err) => {
    if (!err) return;
    console.error('Failed to serve landing page index.html:', err.message);
    res.status(500).type('text/plain').send('Internal Server Error');
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  if (req.originalUrl && req.originalUrl.startsWith('/api')) {
    res.status(500).json({
      message: 'Internal Server Error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
    return;
  }

  res.status(500).type('text/plain').send('Internal Server Error');
});

module.exports = app;
