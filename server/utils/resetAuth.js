/**
 * Utility script to reset authentication for testing
 * Run with: node server/utils/resetAuth.js <email>
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');

const resetUserAuth = async (email) => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      console.log(`User not found: ${email}`);
      process.exit(1);
    }

    console.log(`Found user: ${user.fullName} (${user.email})`);
    console.log(`Auth Provider: ${user.authProvider || 'backend'}`);
    console.log(`Firebase UID: ${user.firebaseUid || 'Not linked'}`);
    console.log(`Biometric Credentials: ${user.biometricCredentials?.length || 0}`);
    
    // Reset biometric credentials
    if (user.biometricCredentials && user.biometricCredentials.length > 0) {
      user.biometricCredentials = [];
      await user.save();
      console.log('✓ Cleared biometric credentials');
    }

    console.log('\nUser authentication reset successfully!');
    console.log('\nYou can now:');
    console.log('1. Login with email/password');
    console.log('2. Login with Google');
    console.log('3. Register new biometric credentials');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

// Get email from command line
const email = process.argv[2];

if (!email) {
  console.log('Usage: node server/utils/resetAuth.js <email>');
  console.log('Example: node server/utils/resetAuth.js sarthnarola007@gmail.com');
  process.exit(1);
}

resetUserAuth(email);
