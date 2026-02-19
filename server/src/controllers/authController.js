import authService from '../services/authService.js';
import asyncHandler from '../middleware/asyncHandler.js';

export const register = asyncHandler(async (req, res) => {
  const { email, password, fullName } = req.body;
  const result = await authService.register(email, password, fullName);

  res.status(201).json({
    success: true,
    message: 'Registration successful',
    data: result
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.login(email, password);

  res.json({
    success: true,
    message: 'Login successful',
    data: result
  });
});

export const getMe = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: {
      user: authService.sanitizeUser(req.user)
    }
  });
});

export const firebaseSync = asyncHandler(async (req, res) => {
  const { uid, email, fullName, picture } = req.body;
  const result = await authService.syncFirebaseUser(uid, email, fullName, picture);

  const statusCode = result.message.includes('created') ? 201 : 200;

  res.status(statusCode).json({
    success: true,
    message: result.message,
    data: {
      token: result.token,
      user: result.user
    }
  });
});

export const linkFirebase = asyncHandler(async (req, res) => {
  const { firebaseUid } = req.body;
  const result = await authService.linkFirebaseToUser(req.user._id, firebaseUid);

  res.json({
    success: true,
    message: result.message,
    data: {
      user: result.user
    }
  });
});
