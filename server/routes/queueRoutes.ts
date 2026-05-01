import { Router } from 'express';
import { joinQueue, updateQueueStatus, getDailyQueue } from '../controllers/queueController';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();

router.use(authenticateToken);

router.post('/join', joinQueue);
router.put('/:id/status', updateQueueStatus);
router.get('/daily', getDailyQueue);

export default router;
