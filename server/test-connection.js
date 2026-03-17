import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

console.log('🔍 Testing MongoDB Connection...\n');
console.log('Connection String:', MONGODB_URI.replace(/:[^:@]+@/, ':****@'));

const options = {
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  family: 4,
};

mongoose.connect(MONGODB_URI, options)
  .then(() => {
    console.log('\n✅ SUCCESS! MongoDB connection established.');
    console.log('Host:', mongoose.connection.host);
    console.log('Database:', mongoose.connection.name);
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ FAILED! MongoDB connection error:');
    console.error('Error:', error.message);
    console.error('\n📋 Troubleshooting Steps:');
    console.error('1. Go to https://cloud.mongodb.com/');
    console.error('2. Navigate to Network Access');
    console.error('3. Click "Add IP Address"');
    console.error('4. Select "Add Current IP Address" or "Allow Access from Anywhere"');
    console.error('5. Wait 1-2 minutes for changes to apply');
    console.error('6. Run this test again: node test-connection.js\n');
    process.exit(1);
  });
