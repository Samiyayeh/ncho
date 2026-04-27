import { Router } from 'express';
import { getPatientProfile } from '../controllers/patientController';
import { authenticateToken } from '../middlewares/authMiddleware';
import { auditLogger } from '../middlewares/auditLogger';

const router = Router();

// Apply auth middleware to all patient routes
router.use(authenticateToken);

// Route: GET /api/patient/profile
// Audit Logger: We track when a patient views their own profile
router.get('/profile', auditLogger('Viewed own patient profile'), getPatientProfile);

export default router;
