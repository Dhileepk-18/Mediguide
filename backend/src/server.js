import express from 'express';
import cors from 'cors';
import { config } from './config/index.js';
import authRoutes from './routes/authRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import doctorRoutes from './routes/doctorRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import medicineRoutes from './routes/medicineRoutes.js';
import healthRecordRoutes from './routes/healthRecordRoutes.js';
import prescriptionRoutes from './routes/prescriptionRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
const app = express();
// Middlewares
app.use(cors({
    origin: true, // Allow all origins for dev flexibility
    credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
// Request logger
app.use((req, _res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    next();
});
// Health check endpoint
app.get('/api/health', (_req, res) => {
    res.json({
        status: 'healthy',
        product: 'MediGuide AI Healthcare Assistant',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        aiEngine: config.geminiApiKey ? 'Google Gemini API' : 'MediGuide Built-in Clinical Engine',
    });
});
// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/health-records', healthRecordRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/admin', adminRoutes);
// 404 Handler
app.use((_req, res) => {
    res.status(404).json({ success: false, message: 'API endpoint not found' });
});
// Start Server
app.listen(config.port, () => {
    console.log(`=======================================================`);
    console.log(`🩺 MediGuide AI Healthcare Backend Server is running!`);
    console.log(`📡 URL: http://localhost:${config.port}`);
    console.log(`🤖 AI Engine: ${config.geminiApiKey ? 'Gemini 1.5 Flash' : 'Built-in Clinical Medical Knowledge Base'}`);
    console.log(`🔒 Authentication: Active (JWT + Role Guards)`);
    console.log(`=======================================================`);
});
