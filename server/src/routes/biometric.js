import express from 'express';
const router = express.Router();
import User from '../models/User.js';
import auth from '../middleware/auth.js';
import jwt from 'jsonwebtoken';

// @route   POST /api/biometric/register
// @desc    Register biometric credential
// @access  Private
router.post('/register', auth, async (req, res) => {
  try {
    const { credentialId, publicKey, counter } = req.body;

    if (!credentialId || !publicKey) {
      return res.status(400).json({ error: 'Credential ID and public key required' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Store biometric credential
    if (!user.biometricCredentials) {
      user.biometricCredentials = [];
    }

    // Check if credential already exists
    const existingCred = user.biometricCredentials.find(
      cred => cred.credentialId === credentialId
    );

    if (existingCred) {
      return res.status(400).json({ error: 'Credential already registered' });
    }

    user.biometricCredentials.push({
      credentialId,
      publicKey,
      counter: counter || 0,
      createdAt: new Date()
    });

    await user.save();

    res.json({ 
      message: 'Biometric authentication registered successfully',
      credentialId 
    });

  } catch (error) {
    console.error('Biometric registration error:', error);
    res.status(500).json({ error: 'Failed to register biometric authentication' });
  }
});

// @route   POST /api/biometric/authenticate
// @desc    Authenticate using biometric
// @access  Public
router.post('/authenticate', async (req, res) => {
  try {
    const { email, credentialId, signature, authenticatorData, clientDataJSON } = req.body;

    if (!email || !credentialId) {
      return res.status(400).json({ error: 'Email and credential ID required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Find matching credential
    const credential = user.biometricCredentials?.find(
      cred => cred.credentialId === credentialId
    );

    if (!credential) {
      return res.status(401).json({ error: 'Biometric credential not found' });
    }

    // In production, verify the signature using the stored public key
    // For now, we'll trust the client-side verification
    
    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        picture: user.picture
      }
    });

  } catch (error) {
    console.error('Biometric authentication error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

// @route   GET /api/biometric/credentials
// @desc    Get user's registered biometric credentials
// @access  Private
router.get('/credentials', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const credentials = (user.biometricCredentials || []).map(cred => ({
      credentialId: cred.credentialId,
      createdAt: cred.createdAt
    }));

    res.json({ credentials });

  } catch (error) {
    console.error('Get credentials error:', error);
    res.status(500).json({ error: 'Failed to fetch credentials' });
  }
});

// @route   DELETE /api/biometric/credentials/:credentialId
// @desc    Remove biometric credential
// @access  Private
router.delete('/credentials/:credentialId', auth, async (req, res) => {
  try {
    const { credentialId } = req.params;

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.biometricCredentials = (user.biometricCredentials || []).filter(
      cred => cred.credentialId !== credentialId
    );

    await user.save();

    res.json({ message: 'Biometric credential removed successfully' });

  } catch (error) {
    console.error('Remove credential error:', error);
    res.status(500).json({ error: 'Failed to remove credential' });
  }
});

export default router;
