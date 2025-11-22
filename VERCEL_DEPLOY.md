# Deploying to Vercel

This guide will help you deploy the Multi-Agent Tourism System to Vercel.

## 🚀 Quick Deploy

### Option 1: Deploy via Vercel CLI (Recommended)

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   vercel
   ```

4. **Deploy to Production:**
   ```bash
   vercel --prod
   ```

### Option 2: Deploy via GitHub Integration

1. **Push your code to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/theakshatkhandelwal/TOURISM-PLANNER.git
   git push -u origin main
   ```

2. **Go to [vercel.com](https://vercel.com) and sign up/login**

3. **Click "Add New Project"**

4. **Import your GitHub repository:**
   - Select `theakshatkhandelwal/TOURISM-PLANNER`
   - Vercel will auto-detect the settings

5. **Configure Build Settings:**
   - **Framework Preset:** Other
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

6. **Add Environment Variables (if needed):**
   - `NODE_ENV=production`
   - `PORT=3000` (optional, Vercel handles this)

7. **Click "Deploy"**

## 📝 Important Notes for Vercel

### Vercel Serverless Functions

Vercel uses serverless functions, which means:
- Each API route becomes a serverless function
- Cold starts may occur (first request might be slower)
- Functions have execution time limits (10s on free tier, 60s on Pro)

### Current Setup

The project is configured to work with Vercel:
- ✅ `vercel.json` - Configuration file
- ✅ `api/index.ts` - Serverless function entry point
- ✅ Express app exports as default for Vercel

### API Endpoints

After deployment, your endpoints will be:
- `https://your-app.vercel.app/health`
- `https://your-app.vercel.app/query` (POST)
- `https://your-app.vercel.app/plan` (GET)
- `https://your-app.vercel.app/` (Web UI)

## 🔧 Troubleshooting

### Build Fails

If the build fails:
1. Check that all dependencies are in `package.json`
2. Ensure TypeScript compiles: `npm run build`
3. Check Vercel build logs

### Function Timeout

If you get timeout errors:
- Vercel free tier: 10 second limit
- Upgrade to Pro for 60 second limit
- Optimize API calls (add caching if needed)

### CORS Issues

CORS is already configured in the Express app. If you still have issues:
- Check the `vercel.json` headers configuration
- Ensure `cors` middleware is enabled

## 🎯 Alternative: Use Vercel API Routes

If the Express app approach doesn't work well, you can convert to Vercel API routes:

1. Create `api/query.ts`:
```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { TourismOrchestrator } from '../src/orchestrator';
import { IntentParser } from '../src/services/intentParser';

const orchestrator = new TourismOrchestrator();
const intentParser = new IntentParser();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { query } = req.body;
  const parsed = intentParser.parseInput(query);
  const result = await orchestrator.plan({
    place: parsed.place,
    what: parsed.queryType,
  });

  return res.json(result);
}
```

2. Create `api/plan.ts` for GET requests
3. Create `api/health.ts` for health checks

## 📚 Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Serverless Functions](https://vercel.com/docs/functions)
- [Deploying Express Apps to Vercel](https://vercel.com/guides/deploying-express-with-vercel)

## ✅ Post-Deployment

After deployment:
1. Test the health endpoint: `https://your-app.vercel.app/health`
2. Test the query endpoint with a POST request
3. Visit the web UI at the root URL
4. Check Vercel dashboard for logs and analytics

## 🎉 Success!

Once deployed, you'll get a URL like:
`https://tourism-planner.vercel.app`

Share this URL to access your deployed application!

