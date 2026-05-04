import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extend Express Request interface to include the user payload
export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: 'patient' | 'provider';
    role_type?: string;
  };
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  const secret = process.env.JWT_SECRET || 'fallback_secret_key_change_me';

  try {
    const decoded = jwt.verify(token, secret) as { id: string; role: 'patient' | 'provider'; role_type?: string };
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token.' });
  }
};
