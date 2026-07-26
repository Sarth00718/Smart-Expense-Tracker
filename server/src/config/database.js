import mongoose from 'mongoose';
import { config } from './env.js';

class Database {
  constructor() {
    this.connection = null;
    this.connecting = null;
    this.reconnectTimer = null;
  }

  async connect(retries = 3) {
    if (this.connection) return this.connection;
    if (this.connecting) return this.connecting;

    this.connecting = (async () => {
      try {
        const options = {
          serverSelectionTimeoutMS: 10000,
          connectTimeoutMS: 10000,
          socketTimeoutMS: 45000,
          family: 4,
          maxPoolSize: 10,
          minPoolSize: 1,
          retryWrites: true,
          retryReads: true,
          heartbeatFrequencyMS: 10000,
        };

        console.log('🔄 Connecting to MongoDB...');
        this.connection = await mongoose.connect(config.mongoUri, options);
        this.setupEventHandlers();
        console.log(`✅ MongoDB Connected: ${mongoose.connection.host}`);
        return this.connection;
      } catch (error) {
        console.error('❌ MongoDB Connection Error:', error.message);

        if (retries > 0) {
          console.log(`🔄 Retrying connection... (${retries} attempts left)`);
          await new Promise(resolve => setTimeout(resolve, 5000));
          return this.connect(retries - 1);
        }

        this.connection = null;
        console.error('\n⚠️  MongoDB connection unavailable. The API will stay up and return 503 for data routes until the database is reachable.\n');
        return null;
      } finally {
        this.connecting = null;
      }
    })();

    return this.connecting;
  }

  setupEventHandlers() {
    mongoose.connection.on('error', (err) => console.error('MongoDB error:', err.message));
    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
      if (!this.reconnectTimer) {
        this.reconnectTimer = setTimeout(() => {
          this.reconnectTimer = null;
          this.connect(1).catch(() => {});
        }, 5000);
      }
    });
    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected');
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = null;
      }
    });
  }

  async disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.connection) {
      await mongoose.connection.close();
      this.connection = null;
    }
  }

  isConnected() {
    return mongoose.connection.readyState === 1;
  }
}

export default new Database();
