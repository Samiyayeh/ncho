import { Router } from 'express';
import { startEncounter, saveClinical, getEncounter, getAnalyticsEncounters } from '../controllers/clinicalController';
import { authenticateToken } from '../middlewares/authMiddleware';
import { auditLogger } from '../middlewares/auditLogger';

const router = Router();

router.use(authenticateToken);

router.get('/analytics', auditLogger('Accessed Analytics'), getAnalyticsEncounters);

router.get('/:encounter_id', auditLogger('Accessed Encounter Data'), getEncounter);

router.post('/start', auditLogger('Started a new encounter'), startEncounter);

router.post('/clinical', auditLogger('Finalized Clinical Consultation'), saveClinical);

export default router;
