// Vercel serverless function wrapper for Express app
// This file handles all routes for Vercel serverless functions

// Import the compiled Express app
// The dist/index.js exports the app as default
let app;
try {
  app = require('../dist/index').default;
} catch (e) {
  // Fallback if default export doesn't work
  app = require('../dist/index');
}

// Export the Express app for Vercel
module.exports = app;
