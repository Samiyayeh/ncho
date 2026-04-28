import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { Patient } from '../models/Patient';
import { MedicalRecord } from '../models/MedicalRecord';
import { Encounter } from '../models/Encounter';
import { Provider } from '../models/Provider';
import { AuditLog } from '../models/AuditLog';
import { QrAccessToken } from '../models/QrAccessToken';
import crypto from 'crypto';

export const getQrToken = async (req: AuthRequest, res: Response) => {
  try {
    const patientId = req.user?.id;
    if (!patientId) return res.status(403).json({ error: 'Unauthorized' });

    // Look for an existing active token
    let token = await QrAccessToken.findOne({
      where: { patient_id: patientId, is_active: true }
    });

    // If none exists, generate a permanent one (expires in 10 years)
    if (!token) {
      const tokenString = crypto.randomUUID();
      const expiresAt = new Date();
      expiresAt.setFullYear(expiresAt.getFullYear() + 10);

      token = await QrAccessToken.create({
        patient_id: patientId,
        token_string: tokenString,
        expires_at: expiresAt,
        is_active: true
      });
    }

    res.json({ token_string: token.token_string });
  } catch (error) {
    console.error('Error fetching QR token:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

export const getPatientProfile = async (req: AuthRequest, res: Response) => {
  try {
    const patientId = req.user?.id;
    
    if (!patientId) {
      return res.status(400).json({ error: 'Patient ID missing from token' });
    }

    const patient = await Patient.findByPk(patientId, {
      attributes: { exclude: ['password_hash'] }
    });
    
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    res.status(200).json(patient);
  } catch (error) {
    console.error('Error fetching patient profile:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

export const getPatientRecords = async (req: AuthRequest, res: Response) => {
  try {
    const patientId = req.user?.id;
    if (!patientId) return res.status(400).json({ error: 'Patient ID missing from token' });

    const records = await MedicalRecord.findAll({
      where: { patient_id: patientId },
      include: [{ model: Provider, attributes: ['first_name', 'last_name'] }],
      order: [['created_at', 'DESC']]
    });
    res.status(200).json(records);
  } catch (error) {
    console.error('Error fetching patient records:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

export const getPatientEncounters = async (req: AuthRequest, res: Response) => {
  try {
    const patientId = req.user?.id;
    if (!patientId) return res.status(400).json({ error: 'Patient ID missing from token' });

    const encounters = await Encounter.findAll({
      where: { patient_id: patientId },
      include: [{ model: Provider, attributes: ['first_name', 'last_name', 'specialty'] }],
      order: [['encounter_date', 'DESC']]
    });

    res.status(200).json(encounters);
  } catch (error) {
    console.error('Error fetching patient encounters:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// Patient's own privacy/audit logs — shows who accessed their records
export const getPatientPrivacyLogs = async (req: AuthRequest, res: Response) => {
  try {
    const patientId = req.user?.id;
    if (!patientId) return res.status(400).json({ error: 'Patient ID missing from token' });

    const logs = await AuditLog.findAll({
      where: { patient_id: patientId },
      include: [{ model: Provider, attributes: ['first_name', 'last_name', 'specialty'] }],
      order: [['timestamp', 'DESC']],
      limit: 100
    });

    res.status(200).json(logs);
  } catch (error) {
    console.error('Error fetching patient privacy logs:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};
