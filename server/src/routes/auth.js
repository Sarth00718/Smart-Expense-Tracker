import express from 'express';
import auth from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import * as authController from '../controllers/authController.js';

const router = express.Router();

router.post('/register', authLimiter, authController.register);
router.post('/login', authLimiter, authController.login);
router.get('/me', auth, authController.getMe);
router.post('/firebase-sync', authLimiter, authController.firebaseSync);
router.post('/link-firebase', auth, authController.linkFirebase);

export default router;
