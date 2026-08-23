import { Router } from 'express';
import { getMyNotifications, markNotificationAsRead, markAllAsRead, deleteNotification } from '../controllers/notificationController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, getMyNotifications);
router.patch('/:id/read', requireAuth, markNotificationAsRead);
router.patch('/read-all', requireAuth, markAllAsRead);
router.delete('/:id', requireAuth, deleteNotification);

export default router;
