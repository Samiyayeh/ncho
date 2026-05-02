import { Response, NextFunction } from 'express';
import { AuthRequest } from './authMiddleware';
import { Provider } from '../models/Provider';

export const requirePRC = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (req.user?.role !== 'provider') {
      return res.status(403).json({ error: 'Only healthcare providers can perform this action.' });
    }

    const provider = await Provider.findByPk(req.user.id);
    if (!provider || !provider.prc_license_number) {
      return res.status(403).json({ 
        error: 'Clinical access denied. A valid PRC License Number is required for this action.' 
      });
    }

    next();
  } catch (error) {
    console.error('requirePRC Middleware Error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};
