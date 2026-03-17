import express from 'express';
import auth from '../middleware/auth.js';
import * as authController from '../controllers/authController.js';

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', auth, authController.getMe);
router.post('/firebase-sync', authController.firebaseSync);
router.post('/link-firebase', auth, authController.linkFirebase);

export default router;
