import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { Encounter } from '../models/Encounter';
import { Queue } from '../models/Queue';
import { Prescription } from '../models/Prescription';
import sequelize from '../config/db';

export const saveTriage = async (req: AuthRequest, res: Response) => {
  const transaction = await sequelize.transaction();
  try {
    const { queue_id, bp_systolic, bp_diastolic, temperature, weight_kg } = req.body;
    const provider_id = req.user?.id;

    if (!provider_id) throw new Error('Unauthorized');

    const queue = await Queue.findByPk(queue_id, { transaction });
    if (!queue) return res.status(404).json({ error: 'Queue record not found.' });

    // Create or update encounter
    const [encounter] = await Encounter.findOrCreate({
      where: { queue_id },
      defaults: {
        patient_id: queue.patient_id,
        provider_id,
        encounter_date: new Date()
      },
      transaction
    });

    await encounter.update({
      bp_systolic,
      bp_diastolic,
      temperature,
      weight: weight_kg
    }, { transaction });

    // Update queue status
    await queue.update({ status: 'WAITING_FOR_PROVIDER' }, { transaction });

    await transaction.commit();
    res.status(200).json({ message: 'Triage data saved successfully', encounter });
  } catch (error: any) {
    await transaction.rollback();
    console.error('Triage Error:', error);
    res.status(500).json({ error: error.message || 'Internal server error.' });
  }
};

export const saveClinical = async (req: AuthRequest, res: Response) => {
  const transaction = await sequelize.transaction();
  try {
    const { queue_id, chief_complaint, diagnosis, treatment_plan, next_step } = req.body;
    const provider_id = req.user?.id;

    if (!provider_id) throw new Error('Unauthorized');

    const queue = await Queue.findByPk(queue_id, { transaction });
    if (!queue) return res.status(404).json({ error: 'Queue record not found.' });

    const encounter = await Encounter.findOne({ where: { queue_id }, transaction });
    if (!encounter) return res.status(404).json({ error: 'Encounter not found. Triage must be completed first.' });

    await encounter.update({
      provider_id, // The physician who handled the consult
      chief_complaint,
      diagnosis,
      treatment_plan
    }, { transaction });

    // Save Prescriptions
    if (req.body.prescriptions && Array.isArray(req.body.prescriptions)) {
      for (const rx of req.body.prescriptions) {
        if (rx.medication_name) {
          await Prescription.create({
            encounter_id: encounter.encounter_id,
            medication_name: rx.medication_name,
            dosage: rx.dosage,
            frequency: rx.frequency,
            duration_days: rx.duration_days || 0
          }, { transaction });
        }
      }
    }

    // Update queue status based on next step
    // next_step could be 'PHARMACY' or 'COMPLETED'
    await queue.update({ status: next_step || 'COMPLETED' }, { transaction });

    await transaction.commit();
    res.status(200).json({ message: 'Clinical encounter saved successfully', encounter });
  } catch (error: any) {
    await transaction.rollback();
    console.error('Clinical Error:', error);
    res.status(500).json({ error: error.message || 'Internal server error.' });
  }
};
