import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { Patient } from '../models/Patient';
import { MedicalRecord } from '../models/MedicalRecord';
import { Encounter } from '../models/Encounter';
import { Provider } from '../models/Provider';
import { AuditLog } from '../models/AuditLog';
import { Prescription } from '../models/Prescription';
import { QrAccessToken } from '../models/QrAccessToken';
import { Queue } from '../models/Queue';
import { Op } from 'sequelize';
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
      include: [{ model: Provider, as: 'Provider', attributes: ['first_name', 'last_name'] }],
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
      include: [
        { model: Provider, as: 'Provider', attributes: ['first_name', 'last_name', 'specialty'] },
        { model: Prescription, as: 'Prescriptions' }
      ],
      order: [['encounter_date', 'DESC']]
    });

    res.status(200).json(encounters);
  } catch (error: any) {
    console.error('CRITICAL ERROR fetching patient encounters:', error);
    // Log the specific Sequelize error details if available
    if (error.name === 'SequelizeDatabaseError') {
      console.error('SQL:', error.sql);
      console.error('Message:', error.message);
    }
    res.status(500).json({ error: 'Internal server error.', details: error.message });
  }
};

// Patient's own privacy/audit logs — shows who accessed their records
export const getPatientPrivacyLogs = async (req: AuthRequest, res: Response) => {
  try {
    const patientId = req.user?.id;
    if (!patientId) return res.status(400).json({ error: 'Patient ID missing from token' });

    const logs = await AuditLog.findAll({
      where: { patient_id: patientId },
      include: [{ model: Provider, as: 'Provider', attributes: ['first_name', 'last_name', 'specialty'] }],
      order: [['timestamp', 'DESC']],
      limit: 100
    });

    res.status(200).json(logs);
  } catch (error) {
    console.error('Error fetching patient privacy logs:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

export const getActiveQueue = async (req: AuthRequest, res: Response) => {
  try {
    const patientId = req.user?.id;
    if (!patientId) return res.status(400).json({ error: 'Patient ID missing from token' });

    const today = new Date().toISOString().split('T')[0];
    const queue = await Queue.findOne({
      where: {
        patient_id: patientId,
        date: today,
        status: { [Op.ne]: 'COMPLETED' } // Still active if not completed
      },
      order: [['created_at', 'DESC']]
    });

    res.status(200).json(queue);
  } catch (error) {
    console.error('Error fetching active queue:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

export const submitIdVerification = async (req: AuthRequest, res: Response) => {
  try {
    const { id_type, id_number } = req.body;
    const patient_id = req.user?.id; // Extracted from auth token
    
    if (!req.file) {
      return res.status(400).json({ error: 'ID image is required.' });
    }

    if (!id_type || !['PHILHEALTH', 'PHILSYS'].includes(id_type)) {
      return res.status(400).json({ error: 'Valid ID type (PHILHEALTH or PHILSYS) is required.' });
    }

    const patient = await Patient.findByPk(patient_id);
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found.' });
    }

    // Only allow submission if unverified or previously rejected
    if (patient.verification_status === 'VERIFIED' || patient.verification_status === 'PENDING_REVIEW') {
      return res.status(400).json({ error: 'Patient is already verified or currently under review.' });
    }

    // Update patient record
    await patient.update({
      id_type,
      id_number: id_number || null,
      id_image_url: req.file.filename, // Store just the filename, not full path
      verification_status: 'PENDING_REVIEW'
    });

    res.status(200).json({ 
      message: 'ID submitted successfully. Please wait for admin review.',
      status: 'PENDING_REVIEW'
    });
    
  } catch (error: any) {
    console.error('ID Submission Error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};
