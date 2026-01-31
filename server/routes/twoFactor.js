const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const {
  generateTOTPSecret,
  generateQRCode,
  verifyTOTP,
  createOTP,
  verifyOTP,
  sendOTPEmail,
  generateBackupCodes,
  verifyBackupCode
} = require('../utils/twoFactor');

/**
 * GET /api/2fa/status
 * Get 2FA status for current user
 */
router.get('/status', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('twoFactorEnabled twoFactorMethod');
    
    res.json({
      enabled: user.twoFactorEnabled,
      method: user.twoFactorMethod
    });
  } catch (error) {
    console.error('2FA status error:', error);
    res.status(500).json({ error: 'Failed to get 2FA status' });
  }
});

/**
 * POST /api/2fa/setup/email
 * Setup email-based 2FA
 */
router.post('/setup/email', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    // Generate and send OTP
    const { otp, expiresAt } = await createOTP(user._id, user.email, '2fa-setup');
    await sendOTPEmail(user.email, otp, '2fa-setup');

    res.json({
      success: true,
      message: 'OTP sent to your email',
      expiresAt,
      // For development only
      ...(process.env.NODE_ENV === 'development' && { devOTP: otp })
    });
  } catch (error) {
    console.error('2FA email setup error:', error);
    res.status(500).json({ error: 'Failed to setup email 2FA' });
  }
});

/**
 * POST /api/2fa/setup/totp
 * Setup TOTP-based 2FA (Google Authenticator)
 */
router.post('/setup/totp', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    // Generate TOTP secret
    const { secret, otpauthUrl } = generateTOTPSecret(user.email);

    // Generate QR code
    const qrCode = await generateQRCode(otpauthUrl);

    // Store secret temporarily (will be confirmed on verification)
    user.twoFactorSecret = secret;
    await user.save();

    res.json({
      success: true,
      secret,
      qrCode,
      message: 'Scan QR code with Google Authenticator'
    });
  } catch (error) {
    console.error('2FA TOTP setup error:', error);
    res.status(500).json({ error: 'Failed to setup TOTP 2FA' });
  }
});

/**
 * POST /api/2fa/verify/email
 * Verify and enable email-based 2FA
 */
router.post('/verify/email', auth, async (req, res) => {
  try {
    const { otp } = req.body;

    if (!otp) {
      return res.status(400).json({ error: 'OTP is required' });
    }

    // Verify OTP
    const verification = await verifyOTP(req.userId, otp, '2fa-setup');

    if (!verification.success) {
      return res.status(400).json({ error: verification.error });
    }

    // Enable 2FA
    const user = await User.findById(req.userId);
    user.twoFactorEnabled = true;
    user.twoFactorMethod = 'email';
    user.twoFactorBackupCodes = generateBackupCodes();
    await user.save();

    res.json({
      success: true,
      message: '2FA enabled successfully',
      backupCodes: user.twoFactorBackupCodes.map(bc => bc.code)
    });
  } catch (error) {
    console.error('2FA email verification error:', error);
    res.status(500).json({ error: 'Failed to verify email 2FA' });
  }
});

/**
 * POST /api/2fa/verify/totp
 * Verify and enable TOTP-based 2FA
 */
router.post('/verify/totp', auth, async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    const user = await User.findById(req.userId).select('+twoFactorSecret');

    if (!user.twoFactorSecret) {
      return res.status(400).json({ error: 'TOTP not setup. Please setup first.' });
    }

    // Verify TOTP token
    const isValid = verifyTOTP(user.twoFactorSecret, token);

    if (!isValid) {
      return res.status(400).json({ error: 'Invalid token' });
    }

    // Enable 2FA
    user.twoFactorEnabled = true;
    user.twoFactorMethod = 'totp';
    user.twoFactorBackupCodes = generateBackupCodes();
    await user.save();

    res.json({
      success: true,
      message: '2FA enabled successfully',
      backupCodes: user.twoFactorBackupCodes.map(bc => bc.code)
    });
  } catch (error) {
    console.error('2FA TOTP verification error:', error);
    res.status(500).json({ error: 'Failed to verify TOTP 2FA' });
  }
});

/**
 * POST /api/2fa/disable
 * Disable 2FA
 */
router.post('/disable', auth, async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }

    const user = await User.findById(req.userId).select('+password +twoFactorSecret');

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    // Disable 2FA
    user.twoFactorEnabled = false;
    user.twoFactorSecret = undefined;
    user.twoFactorBackupCodes = [];
    await user.save();

    res.json({
      success: true,
      message: '2FA disabled successfully'
    });
  } catch (error) {
    console.error('2FA disable error:', error);
    res.status(500).json({ error: 'Failed to disable 2FA' });
  }
});

/**
 * POST /api/2fa/regenerate-backup-codes
 * Regenerate backup codes
 */
router.post('/regenerate-backup-codes', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user.twoFactorEnabled) {
      return res.status(400).json({ error: '2FA is not enabled' });
    }

    user.twoFactorBackupCodes = generateBackupCodes();
    await user.save();

    res.json({
      success: true,
      backupCodes: user.twoFactorBackupCodes.map(bc => bc.code),
      message: 'Backup codes regenerated successfully'
    });
  } catch (error) {
    console.error('Backup codes regeneration error:', error);
    res.status(500).json({ error: 'Failed to regenerate backup codes' });
  }
});

module.exports = router;
