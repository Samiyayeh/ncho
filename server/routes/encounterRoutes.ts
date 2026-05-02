import { Router } from 'express';
import { saveTriage, saveClinical } from '../controllers/clinicalController';
import { authenticateToken } from '../middlewares/authMiddleware';
import { requirePRC } from '../middlewares/roleMiddleware';

const router = Router();

router.use(authenticateToken);

// Triage can be done by TRIAGE_NURSE (must have PRC)
router.post('/triage', requirePRC, saveTriage);

// Clinical consultation must be done by clinical roles (must have PRC)
router.post('/clinical', requirePRC, saveClinical);

export default router;
