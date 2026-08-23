import express from 'express';
import cors from 'cors';
import { config } from './config/index.js';
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

const app = express();

// Middlewares
app.use(cors({
    origin: true, // Allow all origins for dev flexibility
    credentials: true,
}));
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Request logger
app.use((req, _res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    next();
});

// Health check endpoint
app.get('/api/health', (_req, res) => {
    res.json({
        status: 'healthy',
        product: 'MediGuide AI Healthcare Assistant (India)',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        aiEngine: config.geminiApiKey ? 'Google Gemini 1.5 Flash API' : 'MediGuide Built-in Clinical Engine',
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

// Start Server
app.listen(config.port, () => {
    console.log(`=======================================================`);
    console.log(`🩺 MediGuide India — AI Healthcare Backend is running!`);
    console.log(`📡 URL: http://localhost:${config.port}`);
    console.log(`🤖 AI Engine: ${config.geminiApiKey ? 'Google Gemini 1.5 Flash' : 'Built-in Clinical Medical Knowledge Base'}`);
    console.log(`🔒 Authentication: Active (JWT + Role RBAC + Audit Logging)`);
    console.log(`🇮🇳 Localization: INR (₹) | IST Timezone | 112/108 SOS`);
    console.log(`=======================================================`);
});
