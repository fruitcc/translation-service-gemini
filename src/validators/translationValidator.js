const Joi = require('joi');

const translationSchema = Joi.object({
  text: Joi.string()
    .min(1)
    .max(5000)
    .required()
    .messages({
      'string.empty': 'Text to translate is required',
      'string.min': 'Text must be at least 1 character long',
      'string.max': 'Text must not exceed 5000 characters',
      'any.required': 'Text field is required',
    }),
  
  context: Joi.string()
    .max(1000)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Context must not exceed 1000 characters',
    }),
  
  sourceLanguage: Joi.string()
    .min(2)
    .max(10)
    .required()
    .messages({
      'string.empty': 'Source language is required',
      'any.required': 'Source language field is required',
    }),
  
  targetLanguage: Joi.string()
    .min(2)
    .max(10)
    .required()
    .messages({
      'string.empty': 'Target language is required',
      'any.required': 'Target language field is required',
    }),
});

const validateTranslationRequest = (data) => {
  const { error, value } = translationSchema.validate(data, { 
    abortEarly: false,
    stripUnknown: true,
  });
  
  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message,
    }));
    return { isValid: false, errors, value: null };
  }
  
  return { isValid: true, errors: null, value };
};

module.exports = {
  validateTranslationRequest,
};