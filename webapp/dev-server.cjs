/**
 * Development Server for Serverless Functions
 * Runs the /api functions locally during development
 */

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Import serverless functions
const generatePrompt = require('./api/generate-prompt');
const generateSong = require('./api/generate-song');
const checkStatus = require('./api/check-status');

// Route handlers (wrapping serverless functions for Express)
app.post('/api/generate-prompt', async (req, res) => {
  req.body = req.body;
  req.method = 'POST';
  await generatePrompt(req, res);
});

app.post('/api/generate-song', async (req, res) => {
  req.body = req.body;
  req.method = 'POST';
  await generateSong(req, res);
});

app.get('/api/check-status', async (req, res) => {
  req.query = req.query;
  req.method = 'GET';
  await checkStatus(req, res);
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Serverless functions dev server running' });
});

app.listen(PORT, () => {
  console.log(`🚀 Serverless functions dev server running on http://localhost:${PORT}`);
  console.log(`📍 Endpoints:`);
  console.log(`   POST http://localhost:${PORT}/api/generate-prompt`);
  console.log(`   POST http://localhost:${PORT}/api/generate-song`);
  console.log(`   GET  http://localhost:${PORT}/api/check-status`);
});
