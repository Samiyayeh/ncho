import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { PatientModel } from '../models/PatientModel';

export const getPatientProfile = async (req: AuthRequest, res: Response) => {
  try {
    const patientId = req.user?.id;
    
    if (!patientId) {
      return res.status(400).json({ error: 'Patient ID missing from token' });
    }

    const patient = await PatientModel.findById(patientId);
    
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    // Don't send the password hash back!
    delete patient.password_hash;

    res.status(200).json(patient);
  } catch (error) {
    console.error('Error fetching patient profile:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};
