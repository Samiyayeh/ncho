import { Router } from 'express';
import { registerPatient, login } from '../controllers/authController';
import { auditLogger } from '../middlewares/auditLogger';

const router = Router();

// Notice: We don't necessarily log registrations to AUDIT_LOGS since there's no auth token yet,
// but we could if we modified the logger. We will primarily log post-login actions.

router.post('/register/patient', registerPatient);

// We can add the audit logger to login purely to test if we want, 
// but since it requires req.user (from auth token), it's meant for protected routes.
router.post('/login', login);

export default router;
