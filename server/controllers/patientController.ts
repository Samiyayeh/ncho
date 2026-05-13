import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { Account } from '../models/Account';
import { Patient } from '../models/Patient';
import { MedicalRecord } from '../models/MedicalRecord';
import { Encounter } from '../models/Encounter';
import { Provider } from '../models/Provider';
import { AuditLog } from '../models/AuditLog';
import { Prescription } from '../models/Prescription';
import { QrAccessToken } from '../models/QrAccessToken';
import { Op } from 'sequelize';
import crypto from 'crypto';
import bcrypt from 'bcrypt';

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
      include: [{ model: Account, as: 'Account', attributes: ['email'] }]
    });
    
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    // Flatten the email into the response so frontend sees it at top level
    const patientData = patient.toJSON();
    patientData.email = patientData.Account?.email || null;
    delete patientData.Account;

    res.status(200).json(patientData);
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

export const changePassword = async (req: AuthRequest, res: Response) => {
  try {
    const patientId = req.user?.id;
    if (!patientId) return res.status(403).json({ error: 'Unauthorized' });

    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required.' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters long.' });
    }

    const patient = await Patient.findByPk(patientId, {
      include: [{ model: Account, as: 'Account' }]
    });
    if (!patient || !patient.Account) return res.status(404).json({ error: 'Patient not found.' });

    const isMatch = await bcrypt.compare(currentPassword, patient.Account.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Incorrect current password.' });
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    
    await patient.Account.update({ password_hash: newPasswordHash });

    // Note: We don't need to manually create an AuditLog here if we use the auditLogger middleware in the routes
    res.status(200).json({ message: 'Password updated successfully.' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};
