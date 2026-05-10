import { Router } from 'express';
import { startEncounter, saveClinical, getEncounter, cancelEncounter, getAnalyticsEncounters, getDashboardStats, getDpaFeed } from '../controllers/clinicalController';
import { authenticateToken } from '../middlewares/authMiddleware';
import { auditLogger } from '../middlewares/auditLogger';

const router = Router();

router.use(authenticateToken);

router.get('/dashboard-stats', getDashboardStats);
router.get('/dpa-feed', getDpaFeed);
router.get('/analytics', auditLogger('Accessed Analytics'), getAnalyticsEncounters);

router.post('/start', auditLogger('Started a new encounter'), startEncounter);
router.post('/clinical', auditLogger('Finalized Clinical Consultation'), saveClinical);

router.get('/:encounter_id', auditLogger('Accessed Encounter Data'), getEncounter);
router.delete('/:encounter_id', auditLogger('Cancelled Encounter'), cancelEncounter);

export default router;
