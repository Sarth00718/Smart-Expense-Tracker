const mongoose = require('mongoose');

class Database {
  constructor() {
    this.connection = null;
  }

  async connect() {
    try {
      const options = {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        family: 4,
        maxPoolSize: 10,
        minPoolSize: 5,
        retryWrites: true,
        retryReads: true,
      };

      this.connection = await mongoose.connect(
        process.env.MONGODB_URI,
        options
      );

      this.setupEventHandlers();

      if (process.env.NODE_ENV === 'development') {
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
      if (process.env.NODE_ENV === 'development') {
        console.log('MongoDB disconnected. Reconnecting...');
      }
    });

    mongoose.connection.on('reconnected', () => {
      if (process.env.NODE_ENV === 'development') {
        console.log('MongoDB Reconnected');
      }
    });
  }

  async disconnect() {
    if (this.connection) {
      await mongoose.connection.close();
    }
  }
}

module.exports = new Database();
