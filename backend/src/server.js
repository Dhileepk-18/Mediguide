import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { fileURLToPath } from 'url';
import { config } from './config/index.js';
import { connectDB, disconnectDB, isDbConnected } from './config/db.js';
import { authLimiter, aiLimiter, generalLimiter } from './middleware/rateLimiter.js';
import authRoutes from './routes/authRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import doctorRoutes from './routes/doctorRoutes.js';
import departmentRoutes from './routes/departmentRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import medicineRoutes from './routes/medicineRoutes.js';
import healthRecordRoutes from './routes/healthRecordRoutes.js';
import prescriptionRoutes from './routes/prescriptionRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import auditLogRoutes from './routes/auditLogRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';
import { dbStore } from './store/inMemoryStore.js';

const app = express();

// 1. Security Headers (Helmet)
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginEmbedderPolicy: false,
  })
);

// 2. Strict CORS Configuration
const allowedOrigins = [
  config.corsOrigin,
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
];
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, test runners)
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes(origin) ||
        config.nodeEnv === 'development' ||
        config.nodeEnv === 'test'
      ) {
        return callback(null, true);
      }
      return callback(new Error(`CORS error: Origin ${origin} not allowed by policy`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'x-test-suite'],
  })
);

// 3. Body parsers
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// 4. Rate Limiters
app.use('/api', generalLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/forgot-password', authLimiter);
app.use('/api/ai/chat', aiLimiter);
app.use('/api/ai/symptom-check', aiLimiter);

// 5. Request logger
app.use((req, _res, next) => {
  if (process.env.NODE_ENV !== 'test') {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  }
  next();
});

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'healthy',
    product: 'MediGuide AI Healthcare Assistant (India)',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    database: isDbConnected() ? 'MongoDB (Connected)' : 'Local JSON Data Store (Active Fallback)',
    aiEngine: config.geminiApiKey
      ? 'Google Gemini 1.5 Flash API'
      : 'MediGuide Built-in Clinical Engine',
    currency: 'INR (₹)',
    timezone: 'Asia/Kolkata (IST)',
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/health-records', healthRecordRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/audit-logs', auditLogRoutes);
app.use('/api/admin', adminRoutes);

// 404 Handler
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'API endpoint not found' });
});

// Centralized Error Handler (Linear error response format)
app.use(errorHandler);

// Start Server after attempting DB connection
let server;
async function startServer() {
  await connectDB();

  server = app.listen(config.port, () => {
    console.log(`=======================================================`);
    console.log(`🩺 MediGuide India — AI Healthcare Backend is running!`);
    console.log(`📡 URL: http://localhost:${config.port}`);
    console.log(
      `🗄️ Database: ${isDbConnected() ? 'MongoDB (Connected)' : 'Local JSON Data Store (Fallback active)'}`
    );
    console.log(
      `🤖 AI Engine: ${config.geminiApiKey ? 'Google Gemini 1.5 Flash' : 'Built-in Clinical Medical Knowledge Base'}`
    );
    console.log(`🔒 Authentication: Active (JWT + Role RBAC + Audit Logging)`);
    console.log(`🇮🇳 Localization: INR (₹) | IST Timezone | 112/108 SOS`);
    console.log(`=======================================================`);
  });
}

const isDirectRun =
  process.argv[1] &&
  (process.argv[1] === fileURLToPath(import.meta.url) ||
    process.argv[1].endsWith('server.js'));

if (isDirectRun && process.env.NODE_ENV !== 'test') {
  startServer();
}

// Graceful Shutdown
const handleShutdown = async signal => {
  console.log(`\nReceived ${signal}. Flushing data store and closing server...`);
  dbStore.persist();
  await disconnectDB();
  if (server) {
    server.close(() => {
      console.log('HTTP server closed cleanly. Process exiting.');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));

export { app, startServer };
export default app;
