import mongoose from 'mongoose';
import { config } from './env.js';

class Database {
  constructor() {
    this.connection = null;
  }

  async connect(retries = 3) {
    try {
      const options = {
        serverSelectionTimeoutMS: 10000, // Fail fast — 10s is plenty for Atlas
        connectTimeoutMS: 10000,         // TCP connection timeout
        socketTimeoutMS: 45000,          // Operation timeout
        family: 4,                       // Use IPv4 (avoids DNS resolve loops)
        maxPoolSize: 10,
        minPoolSize: 1,                  // Keep 1 warm conn, not 2 (saves resources)
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
        await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
        return this.connect(retries - 1);
      }
      
      console.error('\n⚠️  MONGODB CONNECTION FAILED ⚠️');
      console.error('Please check:');
      console.error('1. Your IP is whitelisted in MongoDB Atlas');
      console.error('2. MongoDB Atlas cluster is running');
      console.error('3. Connection string is correct in .env file');
      console.error('\nVisit: https://cloud.mongodb.com/ to configure Network Access\n');
      
      process.exit(1);
    }
  }

  setupEventHandlers() {
    mongoose.connection.on('error', (err) => console.error('MongoDB error:', err.message));
    mongoose.connection.on('disconnected', () => console.log('MongoDB disconnected'));
    mongoose.connection.on('reconnected', () => console.log('MongoDB reconnected'));
  }

  async disconnect() {
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
