import dotenv from 'dotenv';
dotenv.config();
export const config = {
    port: process.env.PORT ? parseInt(process.env.PORT, 10) : 5000,
    jwtSecret: process.env.JWT_SECRET || 'mediguide_secure_super_secret_jwt_key_2026',
    adminSecretKey: process.env.ADMIN_SECRET_KEY || 'mediguide_admin_2026',
    geminiApiKey: process.env.GEMINI_API_KEY || '',
    mongodbUri: process.env.MONGODB_URI || '',
    nodeEnv: process.env.NODE_ENV || 'development',
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
};
