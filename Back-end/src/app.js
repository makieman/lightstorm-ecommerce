const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
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
const angularDistPath = path.join(__dirname, '../../Front-end/dist/lightstorm-ecommerce/browser');
const landingPagePath = path.join(__dirname, '../../landing-page');

// Serve Angular app at /shop
app.use('/shop', express.static(angularDistPath));

// Serve Landing page at root
app.use(express.static(landingPagePath));

// Catch-all for Angular routing
app.get('/shop/*', (req, res) => {
  res.sendFile(path.join(angularDistPath, 'index.html'));
});

// Catch-all for Landing page navigation
app.get('*', (req, res, next) => {
  if (req.url.startsWith('/api')) return next();
  res.sendFile(path.join(landingPagePath, 'index.html'));
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

module.exports = app;
