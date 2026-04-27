import { Response, NextFunction } from 'express';
import { AuthRequest } from './authMiddleware';
import pool from '../config/db';

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
      // Only log successful actions or specific clinical errors (e.g., status < 400 or specific 403s)
      if (res.statusCode >= 400 && res.statusCode !== 403) return;

      const providerId = req.user?.role === 'provider' ? req.user.id : null;
      const patientId = req.user?.role === 'patient' ? req.user.id : (req.body.patient_id || req.params.patientId || null);
      
      // Determine action taken based on custom description, or fallback to HTTP method and path
      const actionTaken = actionDescription || `[${req.method}] ${req.originalUrl}`;
      const endpoint = req.originalUrl;
      const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';

      try {
        await pool.query(
          `INSERT INTO AUDIT_LOGS (provider_id, patient_id, action_taken, endpoint_accessed, ip_address) 
           VALUES (?, ?, ?, ?, ?)`,
          [providerId, patientId, actionTaken, endpoint, ipAddress]
        );
      } catch (error) {
        // Silently fail the logger so it doesn't break the application flow, but log to server console
        console.error('[Audit Logger Error] Failed to insert log:', error);
      }
    });

    next();
  };
};
