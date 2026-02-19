import mongoose from 'mongoose';
import { config } from './env.js';

class Database {
  constructor() {
    this.connection = null;
  }

  async connect() {
    try {
      const options = {
        serverSelectionTimeoutMS: 30000,
        socketTimeoutMS: 45000,
        family: 4,
        maxPoolSize: 10,
        minPoolSize: 5,
        retryWrites: true,
        retryReads: true,
      };

      this.connection = await mongoose.connect(config.mongoUri, options);

      this.setupEventHandlers();

      if (config.nodeEnv === 'development') {
        console.log('MongoDB Connected');
      }

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
      if (config.nodeEnv === 'development') {
        console.log('MongoDB disconnected. Reconnecting...');
      }
    });

    mongoose.connection.on('reconnected', () => {
      if (config.nodeEnv === 'development') {
        console.log('MongoDB Reconnected');
      }
    });
  }

  async disconnect() {
    if (this.connection) {
      await mongoose.connection.close();
    }
  }

  getConnection() {
    return this.connection;
  }
}

export default new Database();
