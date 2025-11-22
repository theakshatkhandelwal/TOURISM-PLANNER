// Vercel serverless function wrapper for Express app
// This file handles all routes for Vercel serverless functions

const path = require('path');

// Import the compiled Express app
// Handle both CommonJS and ES module exports
let app;

try {
  const indexModule = require('../dist/index');
  // Try default export first (ES modules)
  app = indexModule.default || indexModule;
  
  // If still undefined, try direct require
  if (!app) {
    app = require('../dist/index');
  }
  
  // If it's still an object with default, extract it
  if (app && typeof app === 'object' && app.default) {
    app = app.default;
  }
} catch (error) {
  console.error('Error loading Express app:', error);
  throw error;
}

// Ensure we have the app
if (!app) {
  throw new Error('Failed to load Express app from dist/index.js');
}

// Export as Vercel serverless function handler
module.exports = (req, res) => {
  // Handle the request with Express app
  return app(req, res);
};
