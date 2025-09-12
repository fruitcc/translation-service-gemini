const express = require('express');
const router = express.Router();
const TranslationService = require('../services/translationService');
const { validateTranslationRequest } = require('../validators/translationValidator');

const translationService = new TranslationService();

router.post('/translate', async (req, res, next) => {
  try {
    const validation = validateTranslationRequest(req.body);
    
    if (!validation.isValid) {
      const error = new Error('Validation failed');
      error.name = 'ValidationError';
      error.details = validation.errors;
      throw error;
    }
    
    const result = await translationService.translate(validation.value);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.get('/languages', (req, res) => {
  try {
    const languages = translationService.getSupportedLanguages();
    res.json({
      success: true,
      data: {
        languages,
        count: languages.length,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      service: 'translation-service',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    },
  });
});

module.exports = router;