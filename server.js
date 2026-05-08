const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

// ─── Security middleware (install: npm i helmet express-rate-limit) ───
let helmet, rateLimit;
try { helmet = require('helmet'); } catch { helmet = null; }
try { rateLimit = require('express-rate-limit'); } catch { rateLimit = null; }

const isProd = process.env.NODE_ENV === 'production';

// Connect to database
connectDB();

const app = express();

// Trust Render's reverse proxy so req.ip / rate-limiter work correctly
app.set('trust proxy', 1);

// ─── Security headers ───
if (helmet) {
  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // allow images to be loaded cross-origin
  }));
}

// ─── CORS ───
const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3001',
  ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    // Allow any Vercel preview deployment automatically
    if (origin.endsWith('.vercel.app') || ALLOWED_ORIGINS.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Rate limiting ───
if (rateLimit) {
  // General: 200 req / 15 min per IP
  app.use(rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests, please try again later.' },
  }));

  // Stricter for auth endpoint: 10 req / 15 min
  app.use('/api/auth', rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { success: false, message: 'Too many login attempts. Please wait 15 minutes.' },
  }));
}

// ─── Request logging (dev only) ───
if (!isProd) {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.originalUrl}`);
    next();
  });
}

// ─── Serve static uploaded files ───
app.use(express.static(path.join(__dirname, 'public')));

// ─── Routes ───
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/colleges', require('./routes/colleges'));
app.use('/api/applications', require('./routes/applications'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/upload', require('./routes/uploadRoutes'));

// ─── Health check ───
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    env: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  });
});

// ─── 404 handler ───
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ─── Global error handler ───
app.use((err, req, res, next) => {
  // Log full error in dev; minimal in prod
  if (!isProd) console.error('Unhandled error:', err);
  else console.error(`[ERROR] ${err.message}`);

  // CORS errors
  if (err.message?.startsWith('CORS:')) {
    return res.status(403).json({ success: false, message: err.message });
  }

  res.status(err.status || 500).json({
    success: false,
    message: isProd ? 'Internal server error' : (err.message || 'Internal server error'),
  });
});

// ─── Start server ───
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 Acadura API running — PORT ${PORT} | ENV: ${process.env.NODE_ENV || 'development'}`);
  if (!isProd) console.log(`📊 Health: http://localhost:${PORT}/api/health\n`);
});

