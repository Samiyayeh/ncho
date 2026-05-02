import { Response, NextFunction } from 'express';
import { AuthRequest } from './authMiddleware';
import { AuditLog } from '../models/AuditLog';

/**
 * DPA Compliance Middleware
 * Wraps provider actions and logs them into the AUDIT_LOGS table.
 */
export const logAuditAction = (actionType: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    const provider_id = req.user?.id;
    
    // Attempt to find patient ID in params, query, or body
    const patient_id = req.params.patientId || req.query.patientId || req.body.patient_id;

    if (provider_id && patient_id) {
      try {
        await AuditLog.create({
          provider_id,
          patient_id,
          action_type: actionType,
          timestamp: new Date()
        });
      } catch (error) {
        // We log the error but don't block the request to ensure clinical uptime
        console.error('DPA Audit Logging Failed:', error);
      }
    }
    next();
  };
};
