const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('../config');

class TranslationService {
  constructor() {
    this.apiKeyConfigured = !!config.gemini.apiKey && config.gemini.apiKey !== 'your_gemini_api_key_here';
    
    if (this.apiKeyConfigured) {
      this.genAI = new GoogleGenerativeAI(config.gemini.apiKey);
      this.model = this.genAI.getGenerativeModel({ model: config.gemini.model });
    }
  }

  async translate({ text, context, sourceLanguage, targetLanguage }) {
    if (!this.apiKeyConfigured) {
      return {
        success: false,
        error: {
          message: 'Translation service not configured',
          details: 'Please set up your GEMINI_API_KEY in the .env file. Get your API key from https://aistudio.google.com/app/apikey',
        },
      };
    }
    
    try {
      const prompt = this.buildPrompt({ text, context, sourceLanguage, targetLanguage });
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const translatedText = response.text().trim();
      
      return {
        success: true,
        data: {
          originalText: text,
          translatedText,
          sourceLanguage,
          targetLanguage,
          context,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      console.error('Translation error:', error);
      throw new Error(`Translation failed: ${error.message}`);
    }
  }

  buildPrompt({ text, context, sourceLanguage, targetLanguage }) {
    let prompt = `You are a professional translator specialized in providing accurate and contextually appropriate translations.

Task: Translate the following text from ${sourceLanguage} to ${targetLanguage}.

Text to translate: "${text}"`;

    if (context) {
      prompt += `

Context: ${context}
This context provides important information about the usage scenario. Please ensure the translation is appropriate for this specific context, considering:
- The formality level required
- Domain-specific terminology
- Cultural nuances
- The intended audience`;
    }

    prompt += `

Requirements:
1. Provide ONLY the translated text as output, without any explanations or additional commentary
2. Maintain the original meaning and tone
3. Use natural, fluent ${targetLanguage} that a native speaker would use
4. If the context suggests a specific domain (medical, legal, technical, casual conversation, etc.), use appropriate terminology
5. Preserve any formatting (if present) in the original text

Translated text:`;

    return prompt;
  }

  getSupportedLanguages() {
    return [
      { code: 'en', name: 'English' },
      { code: 'es', name: 'Spanish' },
      { code: 'fr', name: 'French' },
      { code: 'de', name: 'German' },
      { code: 'it', name: 'Italian' },
      { code: 'pt', name: 'Portuguese' },
      { code: 'ru', name: 'Russian' },
      { code: 'ja', name: 'Japanese' },
      { code: 'ko', name: 'Korean' },
      { code: 'zh', name: 'Chinese (Simplified)' },
      { code: 'zh-TW', name: 'Chinese (Traditional)' },
      { code: 'ar', name: 'Arabic' },
      { code: 'hi', name: 'Hindi' },
      { code: 'nl', name: 'Dutch' },
      { code: 'pl', name: 'Polish' },
      { code: 'tr', name: 'Turkish' },
      { code: 'vi', name: 'Vietnamese' },
      { code: 'th', name: 'Thai' },
      { code: 'id', name: 'Indonesian' },
      { code: 'sv', name: 'Swedish' },
    ];
  }
}

module.exports = TranslationService;