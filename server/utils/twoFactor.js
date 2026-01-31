const crypto = require('crypto');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const OTP = require('../models/OTP');

/**
 * Generate 6-digit OTP
 */
function generateOTP() {
  return crypto.randomInt(100000, 999999).toString();
}

/**
 * Generate backup codes for 2FA
 */
function generateBackupCodes(count = 10) {
  const codes = [];
  for (let i = 0; i < count; i++) {
    const code = crypto.randomBytes(4).toString('hex').toUpperCase();
    codes.push({
      code,
      used: false
    });
  }
  return codes;
}

/**
 * Create and store OTP in database
 */
async function createOTP(userId, email, purpose = 'login', expiryMinutes = 10) {
  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

  // Delete any existing OTPs for this user and purpose
  await OTP.deleteMany({ userId, purpose });

  // Create new OTP
  const otpDoc = new OTP({
    userId,
    email,
    otp,
    purpose,
    expiresAt
  });

  await otpDoc.save();

  return {
    otp,
    expiresAt
  };
}

/**
 * Verify OTP
 */
async function verifyOTP(userId, otp, purpose = 'login') {
  const otpDoc = await OTP.findOne({ 
    userId, 
    purpose,
    verified: false 
  }).sort({ createdAt: -1 });

  if (!otpDoc) {
    return { 
      success: false, 
      error: 'OTP not found or already used' 
    };
  }

  // Check if expired
  if (otpDoc.isExpired()) {
    return { 
      success: false, 
      error: 'OTP has expired' 
    };
  }

  // Check attempts
  if (otpDoc.hasExceededAttempts()) {
    return { 
      success: false, 
      error: 'Too many failed attempts. Please request a new OTP' 
    };
  }

  // Verify OTP
  if (otpDoc.otp !== otp) {
    await otpDoc.incrementAttempts();
    return { 
      success: false, 
      error: 'Invalid OTP',
      attemptsLeft: 5 - otpDoc.attempts
    };
  }

  // Mark as verified
  otpDoc.verified = true;
  await otpDoc.save();

  return { 
    success: true, 
    message: 'OTP verified successfully' 
  };
}

/**
 * Generate TOTP secret for Google Authenticator
 */
function generateTOTPSecret(email) {
  const secret = speakeasy.generateSecret({
    name: `Smart Expense Tracker (${email})`,
    issuer: 'Smart Expense Tracker',
    length: 32
  });

  return {
    secret: secret.base32,
    otpauthUrl: secret.otpauth_url
  };
}

/**
 * Generate QR code for TOTP setup
 */
async function generateQRCode(otpauthUrl) {
  try {
    const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl);
    return qrCodeDataUrl;
  } catch (error) {
    throw new Error('Failed to generate QR code');
  }
}

/**
 * Verify TOTP token
 */
function verifyTOTP(secret, token) {
  return speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token,
    window: 2 // Allow 2 time steps before/after for clock skew
  });
}

/**
 * Send OTP via email (mock implementation)
 * In production, integrate with SendGrid, AWS SES, or similar
 */
async function sendOTPEmail(email, otp, purpose = 'login') {
  // Mock email sending
  console.log(`📧 Sending OTP to ${email}: ${otp}`);
  
  // In production, use actual email service:
  /*
  const sgMail = require('@sendgrid/mail');
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  
  const msg = {
    to: email,
    from: process.env.FROM_EMAIL,
    subject: 'Your 2FA Code',
    text: `Your verification code is: ${otp}. Valid for 10 minutes.`,
    html: `<strong>Your verification code is: ${otp}</strong><br>Valid for 10 minutes.`
  };
  
  await sgMail.send(msg);
  */

  return {
    success: true,
    message: 'OTP sent successfully',
    // For development only - remove in production
    devOTP: process.env.NODE_ENV === 'development' ? otp : undefined
  };
}

/**
 * Verify backup code
 */
async function verifyBackupCode(user, code) {
  const backupCode = user.twoFactorBackupCodes.find(
    bc => bc.code === code.toUpperCase() && !bc.used
  );

  if (!backupCode) {
    return false;
  }

  // Mark as used
  backupCode.used = true;
  await user.save();

  return true;
}

module.exports = {
  generateOTP,
  generateBackupCodes,
  createOTP,
  verifyOTP,
  generateTOTPSecret,
  generateQRCode,
  verifyTOTP,
  sendOTPEmail,
  verifyBackupCode
};
