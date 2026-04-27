import { Router } from 'express';
import { 
  getPatientDirectory, 
  createEncounter, 
  uploadMedicalRecord, 
  getMedicalRecords,
  deleteMedicalRecord 
} from '../controllers/providerController';
import { authenticateToken } from '../middlewares/authMiddleware';
import { auditLogger } from '../middlewares/auditLogger';
import { upload } from '../config/multer';

const router = Router();

// Ensure only authenticated users can access provider routes
router.use(authenticateToken);

// GET patient directory
// Audit Logger: Tracks when a provider accesses the global patient directory
router.get('/directory', auditLogger('Accessed Patient Directory'), getPatientDirectory);

// POST create encounter (Digital ITR)
// Audit Logger: Crucial for tracking clinical data entry
router.post('/encounter', auditLogger('Created Clinical Encounter and Prescriptions'), createEncounter);

// POST upload medical record (using Multer for file processing)
router.post('/medical-records/upload', upload.single('documentFile'), auditLogger('Uploaded Medical Record'), uploadMedicalRecord);

// GET patient medical records
router.get('/medical-records/:patientId', auditLogger('Accessed Patient Medical Records'), getMedicalRecords);

// DELETE (soft delete) medical record
router.delete('/medical-records/:recordId', auditLogger('Soft Deleted Medical Record'), deleteMedicalRecord);

export default router;
