import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { Encounter } from '../models/Encounter';
import { Queue } from '../models/Queue';
import { Prescription } from '../models/Prescription';
import { Provider } from '../models/Provider';
import sequelize from '../config/db';

export const saveTriage = async (req: AuthRequest, res: Response) => {
  const transaction = await sequelize.transaction();
  try {
    const { queue_id, bp_systolic, bp_diastolic, temperature, weight_kg, head_circumference, weeks_gestation } = req.body;
    const provider_id = req.user?.id;

    if (!provider_id) throw new Error('Unauthorized');

    // 1. Fetch Queue record
    const queue = await Queue.findByPk(queue_id as string, { transaction });
    if (!queue) return res.status(404).json({ error: 'Queue record not found.' });

    // 2. Database Mutation: INSERT into ENCOUNTERS (Phase 2)
    const [encounter] = await Encounter.findOrCreate({
      where: { queue_id },
      defaults: {
        patient_id: queue.patient_id,
        provider_id,
        encounter_date: new Date(),
        bp_systolic,
        bp_diastolic,
        temperature,
        weight: weight_kg,
        specialized_data: {
          head_circumference,
          weeks_gestation
        }
      },
      transaction
    });

    // If it already existed, update the vitals
    await encounter.update({
      bp_systolic,
      bp_diastolic,
      temperature,
      weight: weight_kg,
      specialized_data: {
        ...(encounter.specialized_data || {}),
        head_circumference,
        weeks_gestation
      }
    }, { transaction });

    // 3. State Change: QUEUES.status = WAITING_FOR_PROVIDER
    await queue.update({ status: 'WAITING_FOR_PROVIDER' }, { transaction });

    await transaction.commit();
    res.status(200).json({ 
      message: 'Triage phase completed. Patient moved to provider queue.', 
      encounter 
    });
  } catch (error: any) {
    await transaction.rollback();
    console.error('Phase 2 Triage Error:', error);
    res.status(500).json({ error: error.message || 'Internal server error.' });
  }
};

export const saveClinical = async (req: AuthRequest, res: Response) => {
  const transaction = await sequelize.transaction();
  try {
    const { queue_id, chief_complaint, diagnosis, treatment_plan, next_step, prescriptions, dental_procedure } = req.body;
    const provider_id = req.user?.id;

    if (!provider_id) throw new Error('Unauthorized');

    // 1. Fetch Queue & Existing Encounter
    const queue = await Queue.findByPk(queue_id as string, { transaction });
    if (!queue) return res.status(404).json({ error: 'Queue record not found.' });

    const encounter = await Encounter.findOne({ where: { queue_id }, transaction });
    if (!encounter) return res.status(404).json({ error: 'Encounter not found. Triage must be completed first.' });

    // --- LEGAL REQUIREMENT: Verify Prescriptive Authority ---
    const prescriber = await Provider.findByPk(provider_id as string, { transaction });
    const prcNumber = prescriber?.prc_license_number;

    const hasMeds = prescriptions && Array.isArray(prescriptions) && prescriptions.length > 0;
    
    if (hasMeds) {
      if (!prcNumber || prescriber?.role_type === 'TRIAGE_NURSE') {
        throw new Error('403 Forbidden: Invalid Prescriptive Authority. Prescription requires a valid physician PRC license.');
      }
    }

    // 2. Database Mutation: UPDATE ENCOUNTERS (Phase 3)
    await encounter.update({
      provider_id,
      chief_complaint,
      diagnosis,
      treatment_plan,
      next_step,
      specialized_data: {
        ...(encounter.specialized_data || {}),
        dental_procedure
      }
    }, { transaction });

    // 3. Database Mutation: INSERT into PRESCRIPTIONS with PRC Snapshot
    if (hasMeds) {
      for (const rx of prescriptions) {
        if (rx.medication_name) {
          await Prescription.create({
            encounter_id: encounter.encounter_id,
            medication_name: rx.medication_name,
            dosage: rx.dosage,
            frequency: rx.frequency,
            duration_days: rx.duration_days || 0,
            prescriber_prc_number: prcNumber // SNAPSHOT
          }, { transaction });
        }
      }
    }

    // 4. State Machine: Phase 3 State Change
    let finalStatus = 'COMPLETED';
    if (hasMeds || next_step === 'PHARMACY') {
      finalStatus = 'PHARMACY';
    } else if (next_step === 'REFERRED_OUT') {
      finalStatus = 'REFERRED_OUT';
    }

    await queue.update({ status: finalStatus }, { transaction });

    await transaction.commit();
    res.status(200).json({ 
      message: `Consultation finalized. Patient status: ${finalStatus}`, 
      encounter 
    });
  } catch (error: any) {
    await transaction.rollback();
    console.error('Phase 3 Consultation Error:', error);
    res.status(500).json({ error: error.message || 'Internal server error.' });
  }
};

/**
 * Phase 4: Fulfillment (Pharmacist)
 */
export const completeDispensing = async (req: AuthRequest, res: Response) => {
  try {
    const { queue_id } = req.body;
    const queue = await Queue.findByPk(queue_id as string);
    
    if (!queue) return res.status(404).json({ error: 'Queue record not found.' });

    // Phase 4 Mutation: Finalize patient journey
    await queue.update({ status: 'COMPLETED' });

    res.status(200).json({ message: 'Medication dispensed. Patient visit completed.', queue_id });
  } catch (error: any) {
    console.error('Phase 4 Fulfillment Error:', error);
    res.status(500).json({ error: error.message || 'Internal server error.' });
  }
};
