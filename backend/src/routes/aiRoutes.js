import { Router } from 'express';
import { handleChat, handleSymptomCheck, getChatHistories, getSymptomHistories, getAiStatus, updateAiConfig, } from '../controllers/aiController.js';
import { authenticateToken } from '../middleware/auth.js';
const router = Router();
router.get('/config', getAiStatus);
router.post('/config', updateAiConfig);
router.post('/chat', (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (authHeader) {
        authenticateToken(req, res, next);
    }
    else {
        next();
    }
}, handleChat);
router.post('/symptom-check', (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (authHeader) {
        authenticateToken(req, res, next);
    }
    else {
        next();
    }
}, handleSymptomCheck);
router.get('/chat-history', authenticateToken, getChatHistories);
router.get('/symptom-history', authenticateToken, getSymptomHistories);
export default router;
