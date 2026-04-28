import { Router } from 'express';
import { 
  getPatientDirectory, 
  createEncounter, 
  uploadMedicalRecord, 
  getMedicalRecords,
  deleteMedicalRecord,
  getPatientEncounters,
  getAdminAuditLogs,
  scanQr,
  patientLookup,
  verifyPatient
} from '../controllers/providerController';
import { authenticateToken } from '../middlewares/authMiddleware';
import { auditLogger } from '../middlewares/auditLogger';
import { upload } from '../config/multer';

const router = Router();
console.log('[ProviderRoutes] Module loaded - encounters route registered.');

// Ensure only authenticated users can access provider routes
router.use(authenticateToken);

// GET patient directory
router.get('/directory', auditLogger('Accessed Patient Directory'), getPatientDirectory);

// POST create encounter (Digital ITR)
router.post('/encounter', auditLogger('Created Clinical Encounter and Prescriptions'), createEncounter);

// POST upload medical record
router.post('/medical-records/upload', upload.single('documentFile'), auditLogger('Uploaded Medical Record'), uploadMedicalRecord);

// GET patient medical records
router.get('/medical-records/:patientId', auditLogger('Accessed Patient Medical Records'), getMedicalRecords);

// GET patient encounter/visit history
router.get('/encounters/:patientId', auditLogger('Accessed Patient Encounter History'), getPatientEncounters);

// DELETE (soft delete) medical record
router.delete('/medical-records/:recordId', auditLogger('Soft Deleted Medical Record'), deleteMedicalRecord);

// GET system audit logs (admin view)
router.get('/audit-logs', getAdminAuditLogs);

// POST scan patient QR code
router.post('/scan-qr', scanQr);

// GET patient lookup
router.get('/patient-lookup', patientLookup);

// POST verify patient
router.post('/verify-patient', verifyPatient);

export default router;
