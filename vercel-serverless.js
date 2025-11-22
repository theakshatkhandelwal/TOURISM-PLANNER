// Alternative Vercel serverless function approach
// This file can be used if the TypeScript approach doesn't work

const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

// For Vercel, we'll use a simpler approach
module.exports = async (req, res) => {
  // Import the Express app
  const app = require('./dist/index').default;
  
  // Handle the request
  return app(req, res);
};

