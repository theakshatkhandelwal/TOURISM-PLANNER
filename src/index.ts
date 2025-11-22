import express, { Request, Response } from 'express';
import cors from 'cors';
import { TourismOrchestrator } from './orchestrator';
import { PlanRequest, QueryType } from './types';
import { IntentParser } from './services/intentParser';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Initialize orchestrator and intent parser
const orchestrator = new TourismOrchestrator();
const intentParser = new IntentParser();

/**
 * GET /plan - Main endpoint for tourism planning
 * Query params:
 *   - place: string (required) - The place name
 *   - what: 'weather' | 'places' | 'all' (default: 'all')
 */
app.get('/plan', async (req: Request, res: Response) => {
  try {
    const { place, what } = req.query;

    // Validation
    if (!place || typeof place !== 'string' || place.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'invalid_request',
        message: 'Place parameter is required',
      });
    }

    let queryType: QueryType = 'all';
    if (what && typeof what === 'string') {
      const normalizedWhat = what.toLowerCase().trim();
      if (['weather', 'places', 'all'].includes(normalizedWhat)) {
        queryType = normalizedWhat as QueryType;
      }
    }

    const request: PlanRequest = {
      place: place.trim(),
      what: queryType,
    };

    const result = await orchestrator.plan(request);

    if (!result.success) {
      return res.status(404).json(result);
    }

    return res.status(200).json(result);
  } catch (error: any) {
    console.error('Error processing request:', error);
    return res.status(500).json({
      success: false,
      error: 'internal_server_error',
      message: 'An unexpected error occurred',
    });
  }
});

/**
 * POST /query - Natural language query endpoint
 * Body: { "query": "I'm going to go to Bangalore, let's plan my trip." }
 */
app.post('/query', async (req: Request, res: Response) => {
  try {
    const { query } = req.body;

    if (!query || typeof query !== 'string' || query.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'invalid_request',
        message: 'Query parameter is required',
      });
    }

    // Parse natural language input
    const parsed = intentParser.parseInput(query.trim());

    if (!parsed.place || parsed.place.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'invalid_request',
        message: 'Could not extract place name from query',
      });
    }

    const request: PlanRequest = {
      place: parsed.place,
      what: parsed.queryType,
    };

    const result = await orchestrator.plan(request);

    if (!result.success) {
      return res.status(404).json(result);
    }

    return res.status(200).json(result);
  } catch (error: any) {
    console.error('Error processing query:', error);
    return res.status(500).json({
      success: false,
      error: 'internal_server_error',
      message: 'An unexpected error occurred',
    });
  }
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Export app for Vercel serverless functions
// Export as both default (ES modules) and CommonJS
export default app;

// Also export for CommonJS (Vercel compatibility)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = app;
  module.exports.default = app;
}

// Start server only if not in Vercel environment
if (process.env.VERCEL !== '1' && typeof require !== 'undefined' && require.main === module) {
  const server = app.listen(PORT, () => {
    const address = server.address();
    const host = typeof address === 'string' ? address : address?.address || 'localhost';
    const port = typeof address === 'string' ? address : address?.port || PORT;
    console.log(`🚀 Tourism API server running on http://${host}:${port}`);
    console.log(`📋 Health: http://${host}:${port}/health`);
    console.log(`📋 Web UI: http://${host}:${port}`);
    console.log(`📋 API: http://${host}:${port}/query`);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
      console.log('HTTP server closed');
      process.exit(0);
    });
  });
}

