const express = require('express');
const router = express.Router();
const { generateDescription } = require('../Controllers/ai.controller');

// POST /api/ai/generate-description
router.post('/generate-description', generateDescription);

module.exports = router;
