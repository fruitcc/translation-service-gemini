# Deployment Guide

This guide covers deploying the translation service to production using various platforms.

## Option 1: Deploy to Render (Recommended - Free Tier Available)

### Prerequisites
- GitHub account with the repository
- Render account (sign up at https://render.com)
- Gemini API key

### Step-by-Step Deployment

1. **Connect GitHub to Render**
   - Go to https://dashboard.render.com
   - Click "New +" → "Web Service"
   - Connect your GitHub account if not already connected
   - Select the `translation-service-gemini` repository

2. **Configure the Service**
   - Name: `translation-service-gemini`
   - Environment: `Node`
   - Region: Choose closest to your users
   - Branch: `main`
   - Build Command: `npm install`
   - Start Command: `npm start`

3. **Set Environment Variables**
   In the Render dashboard, add these environment variables:
   - `NODE_ENV` = `production`
   - `PORT` = `3001` (Render will override with its own)
   - `GEMINI_API_KEY` = `your-actual-gemini-api-key`
   - `RATE_LIMIT_WINDOW_MS` = `60000`
   - `RATE_LIMIT_MAX_REQUESTS` = `100`

4. **Deploy**
   - Click "Create Web Service"
   - Wait for the build and deployment to complete
   - Your service will be available at: `https://your-service-name.onrender.com`

5. **Update iOS App**
   - In your iOS app settings, update the backend URL to your Render URL
   - Example: `https://translation-service-gemini.onrender.com`

## Option 2: Deploy to Railway

### Prerequisites
- GitHub account with the repository
- Railway account (sign up at https://railway.app)
- Gemini API key

### Deployment Steps

1. **Create New Project**
   - Go to https://railway.app/new
   - Choose "Deploy from GitHub repo"
   - Select `translation-service-gemini`

2. **Configure Environment Variables**
   - Click on the service card
   - Go to "Variables" tab
   - Add the same environment variables as listed above

3. **Generate Domain**
   - Go to "Settings" tab
   - Under "Domains", click "Generate Domain"
   - Copy the generated URL for your iOS app

## Option 3: Deploy to Heroku

### Prerequisites
- Heroku CLI installed
- Heroku account (free tier discontinued, requires paid plan)
- Gemini API key

### Create Procfile
Create a `Procfile` in the root directory:
```
web: npm start
```

### Deployment Commands
```bash
# Login to Heroku
heroku login

# Create new app
heroku create translation-service-gemini

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set GEMINI_API_KEY=your-actual-api-key
heroku config:set RATE_LIMIT_WINDOW_MS=60000
heroku config:set RATE_LIMIT_MAX_REQUESTS=100

# Deploy
git push heroku main

# Open the app
heroku open
```

## Option 4: Deploy to Google Cloud Run

### Prerequisites
- Google Cloud account with billing enabled
- Google Cloud CLI installed
- Gemini API key

### Create Dockerfile
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

### Deployment Commands
```bash
# Build and push to Google Container Registry
gcloud builds submit --tag gcr.io/PROJECT-ID/translation-service

# Deploy to Cloud Run
gcloud run deploy translation-service \
  --image gcr.io/PROJECT-ID/translation-service \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars NODE_ENV=production,GEMINI_API_KEY=your-key
```

## Option 5: Deploy to Vercel

### Prerequisites
- Vercel account
- Vercel CLI installed (`npm i -g vercel`)

### Create vercel.json
```json
{
  "version": 2,
  "builds": [
    {
      "src": "src/server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "src/server.js"
    }
  ]
}
```

### Deploy
```bash
vercel --prod
```

## Production Considerations

### Security
1. **API Keys**: Never commit API keys to the repository
2. **CORS**: Configure CORS to only allow your iOS app domain
3. **Rate Limiting**: Adjust limits based on your usage
4. **HTTPS**: Always use HTTPS in production (provided by all platforms above)

### Monitoring
1. **Health Checks**: Use `/api/health` endpoint for monitoring
2. **Logs**: Check platform-specific logging dashboards
3. **Error Tracking**: Consider adding Sentry or similar error tracking

### Performance
1. **Caching**: Consider implementing response caching
2. **Database**: For high volume, consider caching translations in a database
3. **CDN**: Use a CDN for static assets if added in the future

### Scaling
- **Render**: Automatically scales on paid plans
- **Railway**: Automatic scaling available
- **Google Cloud Run**: Auto-scales by default
- **Heroku**: Manual or automatic scaling with dynos

## Testing Production Deployment

After deployment, test your service:

```bash
# Test health endpoint
curl https://your-service-url.com/api/health

# Test translation endpoint
curl -X POST https://your-service-url.com/api/translate \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hello world",
    "sourceLanguage": "en",
    "targetLanguage": "es"
  }'
```

## Updating iOS App

After deployment, update your iOS app:

1. Open the app in Xcode
2. Go to Settings in the app
3. Update Backend URL to your production URL
4. Test the connection using the "Test Connection" button

## Troubleshooting

### Service Not Starting
- Check logs in your platform's dashboard
- Verify all environment variables are set
- Ensure PORT environment variable is not hardcoded

### API Key Issues
- Verify GEMINI_API_KEY is set correctly
- Check API key has not expired
- Ensure API key has correct permissions

### CORS Errors
- Update CORS configuration in `src/app.js`
- Add your iOS app's domain to allowed origins

### Rate Limiting
- Adjust RATE_LIMIT_MAX_REQUESTS if needed
- Consider implementing user-based rate limiting

## Support

For platform-specific issues:
- Render: https://render.com/docs
- Railway: https://docs.railway.app
- Heroku: https://devcenter.heroku.com
- Google Cloud: https://cloud.google.com/run/docs
- Vercel: https://vercel.com/docs