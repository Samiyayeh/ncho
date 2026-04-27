import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import pool from '../config/db';
import { PatientModel } from '../models/PatientModel';
import { MedicalRecordModel } from '../models/MedicalRecordModel';

export const getPatientDirectory = async (req: AuthRequest, res: Response) => {
  try {
    const patients = await PatientModel.findAll();
    
    // Strip passwords before sending to frontend
    const sanitizedPatients = patients.map((p: any) => {
      const { password_hash, ...rest } = p;
      return rest;
    });

    res.status(200).json(sanitizedPatients);
  } catch (error) {
    console.error('Error fetching directory:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

export const createEncounter = async (req: AuthRequest, res: Response) => {
  const connection = await pool.getConnection();
  try {
    const providerId = req.user?.id;
    const { patient_id, blood_pressure, heart_rate, temperature, weight, chief_complaint, diagnosis, treatment_notes, prescriptions } = req.body;

    if (!providerId) return res.status(403).json({ error: 'Unauthorized' });

    await connection.beginTransaction();

    // 1. Create Encounter
    const [encounterResult]: any = await connection.query(
      `INSERT INTO ENCOUNTERS (patient_id, provider_id, blood_pressure, heart_rate, temperature, weight, chief_complaint, diagnosis, treatment_notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [patient_id, providerId, blood_pressure, heart_rate, temperature, weight, chief_complaint, diagnosis, treatment_notes]
    );

    const encounterId = encounterResult.insertId;

    // 2. Create Prescriptions if provided
    if (prescriptions && Array.isArray(prescriptions) && prescriptions.length > 0) {
      for (const rx of prescriptions) {
        if (rx.medicationName) {
          await connection.query(
            `INSERT INTO PRESCRIPTIONS (encounter_id, medication_name, dosage, frequency, duration_days)
             VALUES (?, ?, ?, ?, ?)`,
            [encounterId, rx.medicationName, rx.dosage, rx.frequency, rx.durationDays || 0]
          );
        }
      }
    }

    await connection.commit();
    res.status(201).json({ message: 'Encounter and prescriptions saved successfully', encounter_id: encounterId });
  } catch (error) {
    await connection.rollback();
    console.error('Error saving encounter:', error);
    res.status(500).json({ error: 'Internal server error.' });
  } finally {
    connection.release();
  }
};

export const uploadMedicalRecord = async (req: AuthRequest, res: Response) => {
  try {
    const providerId = req.user?.id;
    if (!providerId) return res.status(403).json({ error: 'Unauthorized' });

    const { patient_id, document_type, description, encounter_id } = req.body;
    
    // Check if multer parsed the file
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    const file_url = `/uploads/${req.file.filename}`;

    const result = await MedicalRecordModel.create({
      patient_id,
      provider_id: providerId,
      encounter_id: encounter_id || null,
      document_type,
      file_url,
      description
    });

    res.status(201).json({ message: 'Medical record uploaded successfully', record_id: (result as any).insertId });
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
    const records = await MedicalRecordModel.findByPatient(patientId);
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

    const result: any = await MedicalRecordModel.softDelete(Number(recordId), providerId);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Record not found or you do not have permission to delete it.' });
    }

    res.status(200).json({ message: 'Medical record deleted (soft delete) successfully.' });
  } catch (error) {
    console.error('Error deleting record:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};
