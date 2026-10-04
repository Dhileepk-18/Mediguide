import dotenv from 'dotenv';
dotenv.config();
export const config = {
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 5000,
  jwtSecret: process.env.JWT_SECRET || 'mediguide_secure_super_secret_jwt_key_2026',
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  jwtRefreshSecret:
    process.env.JWT_REFRESH_SECRET || 'mediguide_refresh_super_secret_jwt_key_2026',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  adminSecretKey: process.env.ADMIN_SECRET_KEY || 'mediguide_admin_2026',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  mongodbUri: process.env.MONGODB_URI || '',
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  mlServiceUrl: process.env.ML_SERVICE_URL || 'http://localhost:8000',
};

