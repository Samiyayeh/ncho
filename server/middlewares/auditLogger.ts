import { Response, NextFunction } from 'express';
import { AuthRequest } from './authMiddleware';
import { AuditLog } from '../models/AuditLog';

/**
 * Automated Audit Logger Middleware
 * 
 * Silently intercepts requests to log interactions into the AUDIT_LOGS table.
 * Crucial for Data Privacy Act (DPA) compliance.
 */
export const auditLogger = (actionDescription?: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    
    // Capture the response finish event to ensure the action actually completed successfully
    res.on('finish', async () => {
      // 1. Silent skip for noisy endpoints (e.g., auto-save drafts)
      if (req.originalUrl.endsWith('/draft')) return;

      // 2. Only log successful actions or specific clinical errors
      if (res.statusCode >= 400 && res.statusCode !== 403) return;

      let providerId = null;
      let patientId = null;

      try {
        if (req.user && req.user.role === 'provider') providerId = req.user.id;
        
        if (req.user && req.user.role === 'patient') {
          patientId = req.user.id;
        } else {
          // Check various sources for patient_id
          patientId = (req as any).patient_id || (req as any).patientId || 
                      req.body?.patient_id || req.body?.patientId ||
                      req.params?.patient_id || req.params?.patientId;
        }
      } catch (e) {
        console.error('[Audit Logger Error] Failed to safely extract IDs:', e);
      }
      
      // Determine action taken based on custom description, or fallback to HTTP method and path
      const actionTaken = actionDescription || `[${req.method}] ${req.originalUrl}`;
      const endpoint = req.originalUrl;
      const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';

      try {
        await AuditLog.create({
          provider_id: providerId,
          patient_id: patientId,
          action_taken: actionTaken,
          endpoint_accessed: endpoint,
          ip_address: ipAddress
        });
      } catch (error) {
        // Silently fail the logger so it doesn't break the application flow, but log to server console
        console.error('[Audit Logger Error] Failed to insert log:', error);
      }
    });

    next();
  };
};
