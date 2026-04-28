import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { Patient } from '../models/Patient';
import { Provider } from '../models/Provider';
import { Encounter } from '../models/Encounter';
import { Prescription } from '../models/Prescription';
import { MedicalRecord } from '../models/MedicalRecord';
import { AuditLog } from '../models/AuditLog';
import { QrAccessToken } from '../models/QrAccessToken';
import sequelize from '../config/db';

export const scanQr = async (req: AuthRequest, res: Response) => {
  try {
    const { token_string } = req.body;
    if (!token_string) return res.status(400).json({ error: 'No QR token provided' });

    const token = await QrAccessToken.findOne({
      where: { token_string, is_active: true }
    });

    if (!token) {
      return res.status(404).json({ error: 'Invalid or revoked QR code' });
    }

    // Verify expiration (just in case they have an old one)
    if (new Date() > new Date(token.expires_at)) {
      return res.status(403).json({ error: 'This QR code has expired' });
    }

    // Log the access event since provider verified physically
    await AuditLog.create({
      provider_id: req.user?.id || 'Unknown',
      patient_id: token.patient_id,
      action: 'Verified Patient via QR Code scan',
      endpoint_accessed: '/api/provider/scan-qr',
      ip_address: req.ip || req.socket.remoteAddress || 'Unknown'
    });

    res.status(200).json({ patient_id: token.patient_id });
  } catch (error) {
    console.error('Error scanning QR:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

export const patientLookup = async (req: AuthRequest, res: Response) => {
  try {
    const { query } = req.query;
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Query parameter required' });
    }

    const patient = await Patient.findOne({
      where: {
        [sequelize.Sequelize.Op.or]: [
          { email: query },
          { patient_id: query }
        ]
      },
      attributes: ['patient_id', 'email', 'first_name', 'last_name', 'account_status', 'created_at']
    });

    if (!patient) {
      return res.status(404).json({ error: 'No matching patient found' });
    }

    res.status(200).json(patient);
  } catch (error) {
    console.error('Error looking up patient:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const verifyPatient = async (req: AuthRequest, res: Response) => {
  const transaction = await sequelize.transaction();
  try {
    const { 
      patient_id, first_name, last_name, date_of_birth, address,
      voter_registered, household_head, blood_type, allergies, chronic_conditions 
    } = req.body;

    if (!patient_id) {
      await transaction.rollback();
      return res.status(400).json({ error: 'Patient ID required' });
    }

    const patient = await Patient.findByPk(patient_id, { transaction });
    if (!patient) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Patient not found' });
    }

    await patient.update({
      first_name,
      last_name,
      date_of_birth,
      address,
      voter_registered: voter_registered === 'yes',
      household_head: household_head === 'yes',
      blood_type,
      allergies: Array.isArray(allergies) ? allergies.join(', ') : allergies,
      chronic_conditions,
      account_status: 'ACTIVE'
    }, { transaction });

    await AuditLog.create({
      provider_id: req.user?.id || 'Unknown',
      patient_id: patient.patient_id,
      action: 'Physically verified patient identity and activated Passport',
      endpoint_accessed: '/api/provider/verify-patient',
      ip_address: req.ip || req.socket.remoteAddress || 'Unknown'
    }, { transaction });

    await transaction.commit();
    res.status(200).json({ message: 'Patient verified and activated successfully' });
  } catch (error) {
    await transaction.rollback();
    console.error('Error verifying patient:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getPatientDirectory = async (req: AuthRequest, res: Response) => {
  try {
    const patients = await Patient.findAll({
      attributes: { exclude: ['password_hash'] }
    });
    res.status(200).json(patients);
  } catch (error) {
    console.error('Error fetching directory:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

export const createEncounter = async (req: AuthRequest, res: Response) => {
  const transaction = await sequelize.transaction();
  try {
    const providerId = req.user?.id;
    const { patient_id, blood_pressure, heart_rate, temperature, weight, chief_complaint, diagnosis, treatment_notes, prescriptions } = req.body;

    if (!providerId) return res.status(403).json({ error: 'Unauthorized' });

    // 1. Create Encounter
    const encounter = await Encounter.create({
      patient_id,
      provider_id: providerId,
      blood_pressure,
      heart_rate,
      temperature,
      weight,
      chief_complaint,
      diagnosis,
      treatment_notes
    }, { transaction });

    // 2. Create Prescriptions if provided
    if (prescriptions && Array.isArray(prescriptions) && prescriptions.length > 0) {
      for (const rx of prescriptions) {
        if (rx.medicationName) {
          await Prescription.create({
            encounter_id: encounter.encounter_id,
            medication_name: rx.medicationName,
            dosage: rx.dosage,
            frequency: rx.frequency,
            duration_days: rx.durationDays || 0
          }, { transaction });
        }
      }
    }

    await transaction.commit();
    res.status(201).json({ message: 'Encounter and prescriptions saved successfully', encounter_id: encounter.encounter_id });
  } catch (error) {
    await transaction.rollback();
    console.error('Error saving encounter:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

export const uploadMedicalRecord = async (req: AuthRequest, res: Response) => {
  try {
    const providerId = req.user?.id;
    if (!providerId) return res.status(403).json({ error: 'Unauthorized' });

    const { patient_id, document_type, description, encounter_id } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    const file_url = `/uploads/${req.file.filename}`;

    const record = await MedicalRecord.create({
      patient_id,
      provider_id: providerId,
      encounter_id: encounter_id || null,
      document_type,
      file_url,
      description
    });

    res.status(201).json({ message: 'Medical record uploaded successfully', record_id: record.record_id });
  } catch (error) {
    console.error('Error uploading medical record:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

export const getMedicalRecords = async (req: AuthRequest, res: Response) => {
  try {
    const { patientId } = req.params;
    if (!patientId || typeof patientId !== 'string') {
      return res.status(400).json({ error: 'Patient ID is required.' });
    }
    const records = await MedicalRecord.findAll({
      where: { patient_id: patientId },
      include: [{ model: Provider, attributes: ['first_name', 'last_name'] }],
      order: [['created_at', 'DESC']]
    });
    res.status(200).json(records);
  } catch (error) {
    console.error('Error fetching records:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

export const deleteMedicalRecord = async (req: AuthRequest, res: Response) => {
  try {
    const providerId = req.user?.id;
    if (!providerId) return res.status(403).json({ error: 'Unauthorized' });

    const { recordId } = req.params;

    const record = await MedicalRecord.findOne({
      where: { record_id: recordId, provider_id: providerId }
    });
    
    if (!record) {
      return res.status(404).json({ error: 'Record not found or you do not have permission to delete it.' });
    }

    await record.destroy(); // Soft deletes natively via paranoid: true

    res.status(200).json({ message: 'Medical record deleted (soft delete) successfully.' });
  } catch (error) {
    console.error('Error deleting record:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

export const getAdminAuditLogs = async (req: AuthRequest, res: Response) => {
  try {
    const logs = await AuditLog.findAll({
      include: [
        { model: Provider, attributes: ['first_name', 'last_name'] },
        { model: Patient, attributes: ['first_name', 'last_name'] }
      ],
      order: [['timestamp', 'DESC']],
      limit: 200
    });
    res.status(200).json(logs);
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

export const getPatientEncounters = async (req: AuthRequest, res: Response) => {
  try {
    const { patientId } = req.params;
    if (!patientId || typeof patientId !== 'string') {
      return res.status(400).json({ error: 'Patient ID is required.' });
    }
    const encounters = await Encounter.findAll({
      where: { patient_id: patientId },
      include: [{ model: Provider, attributes: ['first_name', 'last_name', 'specialty'] }],
      order: [['encounter_date', 'DESC']]
    });
    res.status(200).json(encounters);
  } catch (error) {
    console.error('Error fetching encounters:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};


