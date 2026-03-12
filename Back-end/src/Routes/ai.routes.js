const express = require('express');
const router = express.Router();
const { generateDescription, analyzeProductImage } = require('../Controllers/ai.controller');
const multerConfig = require('../Middlewares/multer');

// POST /api/ai/generate-description
router.post('/generate-description', generateDescription);

// POST /api/ai/analyze-image
router.post('/analyze-image', multerConfig, analyzeProductImage);

module.exports = router;
