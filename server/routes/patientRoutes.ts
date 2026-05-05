import { Router } from 'express';
import { getPatientProfile, getPatientRecords, getPatientEncounters, getPatientPrivacyLogs, getQrToken, getActiveQueue, submitIdVerification } from '../controllers/patientController';
import { authenticateToken } from '../middlewares/authMiddleware';
import { uploadId } from '../config/multer';
import { auditLogger } from '../middlewares/auditLogger';

const router = Router();

// Apply auth middleware to all patient routes
router.use(authenticateToken);

// GET /api/patient/profile
router.get('/profile', auditLogger('Viewed own patient profile'), getPatientProfile);

// GET /api/patient/records
router.get('/records', auditLogger('Viewed own medical records'), getPatientRecords);

// GET /api/patient/encounters
router.get('/encounters', auditLogger('Viewed own encounter history'), getPatientEncounters);

// GET /api/patient/privacy-logs
router.get('/privacy-logs', getPatientPrivacyLogs); // No audit log on this one to avoid infinite loop

// GET /api/patient/active-queue
router.get('/active-queue', getActiveQueue);

// GET /api/patient/qr-token
router.get('/qr-token', getQrToken);

// POST /api/patient/verify-upload
router.post('/verify-upload', uploadId.single('id_image'), submitIdVerification);

export default router;
