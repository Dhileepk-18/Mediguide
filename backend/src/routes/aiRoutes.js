import { Router } from 'express';
import {
  handleChat,
  handleChatStream,
  handleSymptomCheck,
  getChatHistories,
  getSymptomHistories,
  getAiStatus,
  updateAiConfig,
} from '../controllers/aiController.js';
import { authenticateToken, optionalAuthenticate } from '../middleware/auth.js';
const router = Router();
router.get('/config', getAiStatus);
router.post('/config', optionalAuthenticate, updateAiConfig);
router.post('/chat', optionalAuthenticate, handleChat);
router.post('/chat/stream', optionalAuthenticate, handleChatStream);
router.post('/symptom-check', optionalAuthenticate, handleSymptomCheck);
router.get('/chat-history', authenticateToken, getChatHistories);
router.get('/symptom-history', authenticateToken, getSymptomHistories);
export default router;
