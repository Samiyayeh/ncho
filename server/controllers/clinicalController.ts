import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { Encounter } from '../models/Encounter';
import { Patient } from '../models/Patient';
import { Prescription } from '../models/Prescription';
import { Provider } from '../models/Provider';
import sequelize from '../config/db';
import { Op } from 'sequelize';

export const startEncounter = async (req: AuthRequest, res: Response) => {
  try {
    const { patient_id } = req.body;
    const provider_id = req.user?.id;

    if (!provider_id) throw new Error('Unauthorized');

    const patient = await Patient.findByPk(patient_id);
    if (!patient) return res.status(404).json({ error: 'Patient not found.' });

    const encounter = await Encounter.create({
      patient_id,
      provider_id,
      encounter_date: new Date(),
      status: 'IN_PROGRESS'
    } as any);

    res.status(200).json({ encounter_id: encounter.encounter_id });
  } catch (error: any) {
    console.error('Start Encounter Error:', error);
    res.status(500).json({ error: error.message || 'Internal server error.' });
  }
};

export const getEncounter = async (req: AuthRequest, res: Response) => {
  try {
    const { encounter_id } = req.params;
    const encounter = await Encounter.findByPk(encounter_id as string, {
      include: [
        { model: Patient, as: 'Patient' }
      ]
    });
    
    if (!encounter) return res.status(404).json({ error: 'Encounter not found.' });

    res.status(200).json(encounter);
  } catch (error: any) {
    console.error('Get Encounter Error:', error);
    res.status(500).json({ error: error.message || 'Internal server error.' });
  }
};

export const getAnalyticsEncounters = async (req: AuthRequest, res: Response) => {
  try {
    const { date } = req.query;
    let whereClause: any = {};
    if (date && date !== 'all') {
      const targetDate = new Date(date as string);
      const nextDate = new Date(targetDate);
      nextDate.setDate(nextDate.getDate() + 1);
      whereClause.encounter_date = {
        [Op.gte]: targetDate,
        [Op.lt]: nextDate
      };
    }
    const encounters = await Encounter.findAll({
      where: whereClause,
      include: [{ model: Patient, as: 'Patient' }]
    });
    res.status(200).json(encounters);
  } catch (error: any) {
    console.error('Get Analytics Error:', error);
    res.status(500).json({ error: error.message || 'Internal server error.' });
  }
};

export const saveClinical = async (req: AuthRequest, res: Response) => {
  const transaction = await sequelize.transaction();
  try {
    const { 
      encounter_id, 
      bp_systolic, bp_diastolic, temperature, weight_kg,
      chief_complaint, diagnosis, treatment_plan, prescriptions 
    } = req.body;
    
    const provider_id = req.user?.id;
    if (!provider_id) throw new Error('Unauthorized');

    const encounter = await Encounter.findByPk(encounter_id, { transaction });
    if (!encounter) return res.status(404).json({ error: 'Encounter not found.' });

    const prescriber = await Provider.findByPk(provider_id as string, { transaction });
    const prcNumber = prescriber?.prc_license_number;

    await encounter.update({
      bp_systolic: bp_systolic ? parseInt(bp_systolic) : null,
      bp_diastolic: bp_diastolic ? parseInt(bp_diastolic) : null,
      temperature: temperature ? parseFloat(temperature) : null,
      weight: weight_kg ? parseFloat(weight_kg) : null,
      chief_complaint,
      diagnosis,
      treatment_plan,
      status: 'COMPLETED'
    }, { transaction });

    const hasMeds = prescriptions && Array.isArray(prescriptions) && prescriptions.length > 0;
    if (hasMeds) {
      await Prescription.destroy({ where: { encounter_id }, transaction });

      for (const rx of prescriptions) {
        if (rx.medication_name) {
          await Prescription.create({
            encounter_id: encounter.encounter_id,
            medication_name: rx.medication_name,
            dosage: rx.dosage,
            frequency: rx.frequency,
            duration_days: rx.duration_days || 0,
            prescriber_prc_number: prcNumber || 'N/A'
          }, { transaction });
        }
      }
    }

    await transaction.commit();
    res.status(200).json({ 
      message: 'Encounter finalized and completed.', 
      encounter 
    });
  } catch (error: any) {
    await transaction.rollback();
    console.error('Consultation Error:', error);
    res.status(500).json({ error: error.message || 'Internal server error.' });
  }
};
