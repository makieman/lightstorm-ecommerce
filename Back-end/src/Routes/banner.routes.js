const express = require('express');
const router = express.Router();
const {
  getActiveBanner,
  getAllBanners,
  createBanner,
  updateBanner,
  toggleBanner,
  deleteBanner
} = require('../Controllers/banner.controller');

const adminMiddleware = require('../Middlewares/admin.middleware');

// Public route to fetch the currently active banner
router.get('/active', getActiveBanner);

// Admin-only CRUD routes
router.get('/', adminMiddleware, getAllBanners);
router.post('/', adminMiddleware, createBanner);
router.put('/:id', adminMiddleware, updateBanner);
router.patch('/:id/toggle', adminMiddleware, toggleBanner);
router.delete('/:id', adminMiddleware, deleteBanner);

module.exports = router;
