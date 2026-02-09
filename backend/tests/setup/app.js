import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

// Mock database connection before importing
jest.unstable_mockModule('../src/config/database.js', () => ({
  default: jest.fn().mockResolvedValue()
}));

const app = express();

// Middleware
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Test route
app.get('/api/test', (req, res) => {
  res.json({ success: true, message: 'Test endpoint working' });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'API is healthy' });
});

export default app;
