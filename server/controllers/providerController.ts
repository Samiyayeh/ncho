import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { Account } from '../models/Account';
import { Patient } from '../models/Patient';
import { Provider } from '../models/Provider';
import { Encounter } from '../models/Encounter';
import { Prescription } from '../models/Prescription';
import { MedicalRecord } from '../models/MedicalRecord';
import { AuditLog } from '../models/AuditLog';
import { QrAccessToken } from '../models/QrAccessToken';
import sequelize from '../config/db';
import { Op } from 'sequelize';

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
      provider_id: req.user?.id || null,
      patient_id: token.patient_id,
      action_taken: 'Verified Patient via QR Code scan',
      endpoint_accessed: '/api/provider/scan-qr',
      ip_address: req.ip || req.socket.remoteAddress || 'Unknown'
    });

    res.status(200).json({ patient_id: token.patient_id });
  } catch (error: any) {
    console.error('Error scanning QR:', error);
    res.status(500).json({ error: error.message || 'Internal server error.' });
  }
};

export const patientLookup = async (req: AuthRequest, res: Response) => {
  try {
    const { query } = req.query;
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Query parameter required' });
    }

    // Search by patient_id directly, or by email through the Account association
    let patient = await Patient.findOne({
      where: { patient_id: query },
      include: [{ model: Account, as: 'Account', attributes: ['email'] }]
    });

    if (!patient) {
      // Try finding by email through Account
      const account = await Account.findOne({ where: { email: query, role: 'patient' } });
      if (account) {
        patient = await Patient.findOne({
          where: { account_id: account.account_id },
          include: [{ model: Account, as: 'Account', attributes: ['email'] }]
        });
      }
    }

    if (!patient) {
      return res.status(404).json({ error: 'No matching patient found' });
    }

    // Flatten email and pick specific fields for the response
    const data = patient.toJSON();
    data.email = data.Account?.email || null;
    delete data.Account;

    // Set patient_id for audit logger
    (req as any).patient_id = data.patient_id;

    res.status(200).json(data);
  } catch (error) {
    console.error('Error looking up patient:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


export const getPatientDirectory = async (req: AuthRequest, res: Response) => {
  try {
    const patients = await Patient.findAll({
      include: [{ model: Account, as: 'Account', attributes: ['email'] }]
    });
    // Flatten email into each patient object for frontend compatibility
    const result = patients.map(p => {
      const data = p.toJSON();
      data.email = data.Account?.email || null;
      delete data.Account;
      return data;
    });
    res.status(200).json(result);
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

    // Enforce Required Fields Validation
    if (!blood_pressure || !temperature || !weight || !chief_complaint || !diagnosis) {
      await transaction.rollback();
      return res.status(400).json({ error: 'Blood Pressure, Temperature, Weight, Chief Complaint, and Diagnosis are required.' });
    }

    const provider = await Provider.findByPk(providerId as string, { transaction });
    const prcNumber = provider?.prc_license_number || 'N/A';

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
    } as any, { transaction });

    // 2. Create Prescriptions if provided
    if (prescriptions && Array.isArray(prescriptions) && prescriptions.length > 0) {
      for (const rx of prescriptions) {
        const medName = rx.medication_name || rx.medicationName;
        if (medName) {
          await Prescription.create({
            encounter_id: encounter.encounter_id,
            medication_name: medName,
            dosage: rx.dosage,
            frequency: rx.frequency,
            duration_days: rx.duration_days || rx.durationDays || 0,
            prescriber_prc_number: prcNumber
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
  const transaction = await sequelize.transaction();
  try {
    const providerId = req.user?.id;
    if (!providerId) {
      await transaction.rollback();
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { patient_id, document_type, description } = req.body;
    
    if (!req.file) {
      await transaction.rollback();
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    const file_url = `/uploads/${req.file.filename}`;

    // 1. Create a shadow encounter for this upload so it shows in the dashboard
    const encounter = await Encounter.create({
      patient_id,
      provider_id: providerId,
      encounter_date: new Date(),
      status: 'COMPLETED',
      encounter_type: 'FILE_UPLOAD',
      diagnosis: `Uploaded: ${document_type}`,
      chief_complaint: 'Document Filing'
    } as any, { transaction });

    // 2. Create the record linked to this encounter
    const record = await MedicalRecord.create({
      patient_id,
      provider_id: providerId,
      encounter_id: encounter.encounter_id,
      document_type,
      file_url,
      description
    }, { transaction });

    await transaction.commit();
    res.status(201).json({ 
      message: 'Medical record uploaded and encounter recorded successfully', 
      record_id: record.record_id,
      encounter_id: encounter.encounter_id
    });
  } catch (error) {
    await transaction.rollback();
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
      include: [{ model: Provider, as: 'Provider', attributes: ['first_name', 'last_name'] }],
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

    // Set patient_id for audit logger
    (req as any).patient_id = record.patient_id;

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
        { model: Provider, as: 'Provider', attributes: ['first_name', 'last_name'] },
        { model: Patient, as: 'Patient', attributes: ['first_name', 'last_name'] }
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
      where: { patient_id: patientId, status: 'COMPLETED' },
      include: [
        { model: Provider, as: 'Provider', attributes: ['first_name', 'last_name', 'specialty'] },
        { model: Prescription, as: 'Prescriptions' }
      ],
      order: [['encounter_date', 'DESC']]
    });
    res.status(200).json(encounters);
  } catch (error) {
    console.error('Error fetching encounters:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};


import path from 'path';
import fs from 'fs';

export const viewIdImage = async (req: AuthRequest, res: Response) => {
  try {
    const { filename } = req.params;
    // VERY IMPORTANT: Prevent directory traversal
    if (filename.includes('..') || filename.includes('/')) {
      return res.status(400).json({ error: 'Invalid filename' });
    }

    const filePath = path.join(process.cwd(), 'uploads', 'ids', filename as string);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Image not found' });
    }

    res.sendFile(filePath);
  } catch (error) {
    console.error('Error viewing ID image:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};


