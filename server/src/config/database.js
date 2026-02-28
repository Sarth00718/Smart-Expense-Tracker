import mongoose from 'mongoose';
import { config } from './env.js';

class Database {
  constructor() {
    this.connection = null;
  }

  async connect() {
    try {
      const options = {
        serverSelectionTimeoutMS: 10000, // Reduced from 30s — fail faster on bad URI
        socketTimeoutMS: 45000,
        family: 4,
        maxPoolSize: 10,
        minPoolSize: 2,          // Reduced minimum to save resources on cold start
        retryWrites: true,
        retryReads: true,
        // Faster heartbeat for better connection health detection
        heartbeatFrequencyMS: 10000,
      };

      this.connection = await mongoose.connect(config.mongoUri, options);

      this.setupEventHandlers();

      console.log(`MongoDB Connected: ${mongoose.connection.host}`);

      return this.connection;
    } catch (error) {
      console.error('MongoDB Connection Error:', error.message);
      process.exit(1);
    }
  }

  setupEventHandlers() {
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB error:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected');
    });
  }

  async disconnect() {
    if (this.connection) {
      await mongoose.connection.close();
      this.connection = null;
    }
  }

  getConnection() {
    return mongoose.connection.readyState === 1; // 1 = connected
  }

  isConnected() {
    return mongoose.connection.readyState === 1;
  }
}

export default new Database();
