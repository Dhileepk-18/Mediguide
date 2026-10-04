import mongoose from 'mongoose';
import { config } from './index.js';

let isConnected = false;

/**
 * Connect to MongoDB database with fallback and error handling.
 * If MONGODB_URI is provided and reachable, connects to MongoDB.
 * If unreachable or not provided, gracefully falls back to local data store.
 */
export async function connectDB() {
  const uri = config.mongodbUri || process.env.MONGODB_URI;

  if (!uri) {
    console.log('ℹ️ [Database] MONGODB_URI is not configured in .env.');
    console.log('📦 [Database] Operating in persistent local JSON store mode.');
    isConnected = false;
    return false;
  }

  try {
    console.log('⏳ [Database] Attempting connection to MongoDB...');
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000, // 5s timeout to prevent hanging
    });

    isConnected = conn.connection.readyState === 1;
    console.log(`✅ [Database] MongoDB Connected successfully: ${conn.connection.host}/${conn.connection.name}`);
    return true;
  } catch (error) {
    isConnected = false;
    console.error('❌ [Database] MongoDB connection failed:', error.message);
    console.warn('⚠️ [Database] Falling back to persistent local JSON store mode (data_store.json).');
    return false;
  }
}

/**
 * Check if active MongoDB connection is open and ready.
 */
export function isDbConnected() {
  return isConnected && mongoose.connection.readyState === 1;
}

/**
 * Disconnect from MongoDB cleanly.
 */
export async function disconnectDB() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    isConnected = false;
    console.log('🔌 [Database] MongoDB disconnected.');
  }
}
