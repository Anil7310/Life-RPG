import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import questRoutes from './routes/questRoutes.js';
import shopRoutes from './routes/shopRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5001;

// Trust reverse proxy (Render, Vercel, Railway, AWS, Heroku)
app.set('trust proxy', 1);

// Middlewares
const allowedOrigins = process.env.FRONTEND_URL
  ? [
      process.env.FRONTEND_URL.replace(/\/+$/, ''),
      'http://localhost:5173',
      'http://localhost:3000',
      'http://127.0.0.1:5173'
    ]
  : '*';

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/quests', questRoutes);
app.use('/api/shop', shopRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    game: 'Life RPG API',
    uptime: process.uptime(),
    time: new Date().toISOString()
  });
});

// Serve frontend static build if present (Unified monorepo deploy)
const clientDistPath = path.join(__dirname, '../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
} else {
  // Root landing endpoint for standalone backend API deploy
  app.get('/', (req, res) => {
    res.json({
      message: '🏰 Welcome to Life RPG Backend API',
      status: 'online',
      version: '1.0.0',
      endpoints: {
        health: '/api/health',
        auth: '/api/auth',
        quests: '/api/quests',
        shop: '/api/shop'
      }
    });
  });
}

// 404 handler for unknown API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Start Server & Connect Database
const startServer = async () => {
  await connectDB();
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`🏰 Life RPG Server listening on port ${PORT}`);
  });

  // Graceful shutdown
  const handleShutdown = () => {
    console.log('Stopping Life RPG server gracefully...');
    server.close(() => {
      console.log('Server shut down cleanly.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', handleShutdown);
  process.on('SIGINT', handleShutdown);
};

startServer();
