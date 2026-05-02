import { Router } from 'express';
import { saveTriage, saveClinical, completeDispensing } from '../controllers/clinicalController';
import { authenticateToken } from '../middlewares/authMiddleware';
import { requirePRC } from '../middlewares/roleMiddleware';
import { auditLogger } from '../middlewares/auditLogger';

const router = Router();

router.use(authenticateToken);

// Phase 2: Gateway (Triage Nurse Dashboard)
router.post('/triage', requirePRC, auditLogger('Phase 2: Recorded Patient Vitals'), saveTriage);

// Phase 3: Consultation (Provider Dashboard)
router.post('/clinical', requirePRC, auditLogger('Phase 3: Finalized Clinical Consultation'), saveClinical);

// Phase 4: Fulfillment (Pharmacist Dashboard)
router.post('/dispensing', requirePRC, auditLogger('Phase 4: Dispensed Medication & Completed Visit'), completeDispensing);

export default router;
