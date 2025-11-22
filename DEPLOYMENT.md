# Deployment Guide

This guide covers multiple deployment options for the Multi-Agent Tourism System.

## 🐳 Docker Deployment

### Local Docker

```bash
# Build and run with Docker Compose
docker-compose up --build

# Or build and run manually
docker build -t tourism-api .
docker run -p 3000:3000 tourism-api
```

### Docker on Cloud

#### DigitalOcean App Platform
1. Push code to GitHub
2. Go to DigitalOcean → Apps → Create App
3. Connect GitHub repository
4. Select Dockerfile as build method
5. Deploy

#### AWS ECS/Fargate
```bash
# Build and tag
docker build -t tourism-api .
docker tag tourism-api:latest YOUR_ECR_REPO/tourism-api:latest

# Push to ECR
aws ecr get-login-password --region REGION | docker login --username AWS --password-stdin YOUR_ECR_REPO
docker push YOUR_ECR_REPO/tourism-api:latest

# Create ECS task definition and deploy
```

## ☁️ Platform-Specific Deployments

### 1. Render.com (Recommended - Free Tier Available)

1. **Sign up** at [render.com](https://render.com)
2. **Create New Web Service**
3. **Connect your GitHub repository**
4. **Configure:**
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Environment:** Node
   - **Port:** 3000 (or use Render's PORT env var)
5. **Deploy**

Or use the `render.yaml` file:
```bash
# Just push to GitHub and Render will auto-detect render.yaml
```

### 2. Railway.app

1. **Sign up** at [railway.app](https://railway.app)
2. **New Project** → **Deploy from GitHub**
3. **Select your repository**
4. Railway auto-detects `railway.json` and deploys
5. **Add custom domain** (optional)

### 3. Heroku

```bash
# Install Heroku CLI
# Login
heroku login

# Create app
heroku create your-app-name

# Deploy
git push heroku main

# Open app
heroku open
```

The `Procfile` is already configured.

### 4. Vercel (Serverless)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Production deploy
vercel --prod
```

Note: Vercel works best with serverless functions. You may need to adapt the Express app.

### 5. Fly.io

```bash
# Install flyctl
# Login
fly auth login

# Launch app
fly launch

# Deploy
fly deploy
```

### 6. AWS Elastic Beanstalk

```bash
# Install EB CLI
pip install awsebcli

# Initialize
eb init -p node.js tourism-api

# Create environment
eb create tourism-api-env

# Deploy
eb deploy
```

### 7. Google Cloud Run

```bash
# Build container
gcloud builds submit --tag gcr.io/PROJECT_ID/tourism-api

# Deploy
gcloud run deploy tourism-api \
  --image gcr.io/PROJECT_ID/tourism-api \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

### 8. Azure App Service

```bash
# Install Azure CLI
# Login
az login

# Create resource group
az group create --name tourism-rg --location eastus

# Create app service plan
az appservice plan create --name tourism-plan --resource-group tourism-rg --sku FREE

# Create web app
az webapp create --resource-group tourism-rg --plan tourism-plan --name tourism-api

# Deploy
az webapp up --name tourism-api --resource-group tourism-rg
```

## 🔧 Environment Variables

No API keys are required! All APIs used are public/open-source:
- Nominatim (OpenStreetMap) - Public
- Open-Meteo - Public
- Overpass API - Public

Optional environment variables:
```bash
PORT=3000              # Server port (default: 3000)
NODE_ENV=production    # Environment mode
```

## 📋 Pre-Deployment Checklist

- [ ] Test locally: `npm test`
- [ ] Build successfully: `npm run build`
- [ ] Test API endpoints
- [ ] Update README if needed
- [ ] Set environment variables on platform
- [ ] Configure custom domain (optional)
- [ ] Set up monitoring/logging (optional)

## 🚀 Quick Deploy Commands

### Render
```bash
# Just push to GitHub, Render auto-deploys
git push origin main
```

### Railway
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

### Heroku
```bash
git push heroku main
```

## 🔍 Post-Deployment

1. **Test the API:**
   ```bash
   curl https://your-app.com/health
   curl https://your-app.com/query -X POST -H "Content-Type: application/json" -d '{"query":"I'\''m going to go to Bangalore, let'\''s plan my trip."}'
   ```

2. **Monitor logs:**
   - Render: Dashboard → Logs
   - Railway: `railway logs`
   - Heroku: `heroku logs --tail`

3. **Check health:**
   - Visit: `https://your-app.com/health`
   - Visit: `https://your-app.com` (web interface)

## 💡 Recommended Platforms

**Best for beginners:**
- **Render.com** - Free tier, easy setup, auto-deploy from GitHub
- **Railway.app** - Free tier, simple deployment

**Best for production:**
- **AWS ECS/Fargate** - Scalable, enterprise-grade
- **Google Cloud Run** - Serverless containers
- **DigitalOcean App Platform** - Simple, reliable

**Best for quick testing:**
- **Heroku** - Classic, well-documented
- **Fly.io** - Fast, global edge network

## 🐛 Troubleshooting

### Build fails
- Check Node.js version (requires 18+)
- Verify all dependencies in `package.json`
- Check build logs for specific errors

### App crashes on start
- Verify `PORT` environment variable is set
- Check that `dist/` folder exists (run `npm run build`)
- Review application logs

### API calls fail
- Verify external APIs are accessible (Nominatim, Open-Meteo, Overpass)
- Check network/firewall settings
- Review timeout settings in services

## 📞 Support

For deployment issues, check:
1. Platform-specific documentation
2. Application logs
3. Health endpoint: `/health`

