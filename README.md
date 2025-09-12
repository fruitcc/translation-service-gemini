# Translation Service API

A backend translation service leveraging Google's Gemini AI to provide accurate, context-aware translations for iOS applications.

## Features

- Context-aware translations using Gemini AI
- Support for 20+ languages
- Input validation and error handling
- Rate limiting to prevent abuse
- CORS configuration for iOS app integration
- Health check endpoint
- Request logging
- Security headers with Helmet

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Gemini API key from Google AI Studio

## Installation

1. Clone the repository:
```bash
cd translation-service
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

4. Add your Gemini API key to the `.env` file:
```
GEMINI_API_KEY=your_actual_gemini_api_key_here
```

## Running the Service

### Development mode (with auto-reload):
```bash
npm run dev
```

### Production mode:
```bash
npm start
```

The service will run on `http://localhost:3000` by default.

## API Endpoints

### 1. Translate Text
**POST** `/api/translate`

Request body:
```json
{
  "text": "Hello, how are you?",
  "context": "Casual conversation between friends",
  "sourceLanguage": "en",
  "targetLanguage": "es"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "originalText": "Hello, how are you?",
    "translatedText": "Hola, ¿cómo estás?",
    "sourceLanguage": "en",
    "targetLanguage": "es",
    "context": "Casual conversation between friends",
    "timestamp": "2024-01-01T12:00:00.000Z"
  }
}
```

### 2. Get Supported Languages
**GET** `/api/languages`

Response:
```json
{
  "success": true,
  "data": {
    "languages": [
      { "code": "en", "name": "English" },
      { "code": "es", "name": "Spanish" },
      ...
    ],
    "count": 20
  }
}
```

### 3. Health Check
**GET** `/api/health`

Response:
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "service": "translation-service",
    "timestamp": "2024-01-01T12:00:00.000Z",
    "uptime": 3600
  }
}
```

## Configuration

Configuration options in `.env`:

- `GEMINI_API_KEY`: Your Gemini API key (required)
- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment (development/production)
- `RATE_LIMIT_MAX`: Max requests per window (default: 100)
- `RATE_LIMIT_WINDOW_MS`: Rate limit window in ms (default: 60000)
- `ALLOWED_ORIGINS`: Comma-separated CORS origins

## Security Features

- **Rate Limiting**: Prevents API abuse (configurable limits)
- **CORS**: Configured for specific origins
- **Helmet**: Security headers for protection
- **Input Validation**: Joi validation for all inputs
- **Error Handling**: Centralized error handling
- **Request Logging**: All requests are logged

## iOS Integration

For iOS app integration:

1. Update `ALLOWED_ORIGINS` in `.env` to include your iOS app's domain
2. Use the `/api/translate` endpoint with proper headers
3. Handle responses and errors appropriately
4. Consider implementing caching on the client side

## Future Enhancements

- Authentication mechanism (JWT/API keys)
- Request/response caching with Redis
- Translation history storage
- Batch translation support
- WebSocket support for real-time translations
- User preferences and custom dictionaries
- Analytics and usage tracking

## Error Responses

All errors follow this format:
```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "details": "Additional error information"
  }
}
```

Common HTTP status codes:
- 200: Success
- 400: Bad Request (validation errors)
- 401: Unauthorized
- 429: Too Many Requests (rate limit)
- 500: Internal Server Error