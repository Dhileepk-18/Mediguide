import { Router } from 'express';
import {
  register,
  login,
  demoLogin,
  getMe,
  updateProfile,
  forgotPassword,
  resetPassword,
  exportUserData,
  deleteAccount,
  getDemoAccounts,
} from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/demo-login', demoLogin);
router.get('/me', requireAuth, getMe);
router.put('/profile', requireAuth, updateProfile);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/export-data', requireAuth, exportUserData);
router.delete('/delete-account', requireAuth, deleteAccount);
router.get('/demo-accounts', getDemoAccounts);

export default router;
