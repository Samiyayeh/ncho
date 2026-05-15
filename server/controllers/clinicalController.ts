import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { Encounter } from '../models/Encounter';
import { Patient } from '../models/Patient';
import { Prescription } from '../models/Prescription';
import { Provider } from '../models/Provider';
import { AuditLog } from '../models/AuditLog';
import sequelize from '../config/db';
import { Op, fn, col, literal } from 'sequelize';

export const startEncounter = async (req: AuthRequest, res: Response) => {
  try {
    const { patient_id } = req.body;
    const provider_id = req.user?.id;

    if (!provider_id) throw new Error('Unauthorized');

    const patient = await Patient.findByPk(patient_id);
    if (!patient) return res.status(404).json({ error: 'Patient not found.' });

    // If an IN_PROGRESS encounter already exists for this patient, resume it
    const existing = await (Encounter as any).findOne({
      where: { patient_id, status: 'IN_PROGRESS' }
    });

    if (existing) {
      return res.status(200).json({ encounter_id: existing.encounter_id, resumed: true });
    }

    const encounter = await Encounter.create({
      patient_id,
      provider_id,
      encounter_date: new Date(),
      status: 'IN_PROGRESS'
    } as any);

    res.status(200).json({ encounter_id: encounter.encounter_id, resumed: false });
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
        { model: Patient, as: 'Patient' },
        { model: Prescription, as: 'Prescriptions' }
      ]
    });
    
    if (!encounter) return res.status(404).json({ error: 'Encounter not found.' });

    // Set patient_id for the audit logger
    (req as any).patient_id = encounter.patient_id;

    res.status(200).json(encounter);
  } catch (error: any) {
    console.error('Get Encounter Error:', error);
    res.status(500).json({ error: error.message || 'Internal server error.' });
  }
};

export const cancelEncounter = async (req: AuthRequest, res: Response) => {
  try {
    const { encounter_id } = req.params;
    const encounter = await Encounter.findByPk(encounter_id as string);
    if (!encounter) return res.status(404).json({ error: 'Encounter not found.' });
    if (encounter.status !== 'IN_PROGRESS') {
      return res.status(400).json({ error: 'Only IN_PROGRESS encounters can be cancelled.' });
    }
    
    // Set patient_id for the audit logger
    (req as any).patient_id = encounter.patient_id;

    await encounter.destroy();
    res.status(200).json({ message: 'Encounter cancelled and removed.' });
  } catch (error: any) {
    console.error('Cancel Encounter Error:', error);
    res.status(500).json({ error: error.message || 'Internal server error.' });
  }
};

export const getAnalyticsEncounters = async (req: AuthRequest, res: Response) => {
  try {
    const { date } = req.query;
    let whereClause: any = { status: 'COMPLETED' };
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
      chief_complaint, diagnosis, treatment_plan, prescriptions,
      // First-encounter patient fields
      blood_type, allergies
    } = req.body;
    
    const provider_id = req.user?.id;
    if (!provider_id) throw new Error('Unauthorized');

    // 1. Enforce Required Fields Validation (per user request)
    if (!bp_systolic || !bp_diastolic || !temperature || !weight_kg || !chief_complaint || !diagnosis) {
      return res.status(400).json({ 
        error: 'Incomplete Encounter Data. Blood Pressure, Temperature, Weight, Chief Complaint, and Diagnosis are all required.' 
      });
    }

    const encounter = await Encounter.findByPk(encounter_id, { transaction });
    if (!encounter) return res.status(404).json({ error: 'Encounter not found.' });

    // Set patient_id for audit logger
    (req as any).patient_id = encounter.patient_id;

    // Fetch the actual provider to get their PRC license for the e-prescription
    const prescriber = await Provider.findByPk(provider_id as string, { transaction });
    const prcNumber = prescriber?.prc_license_number || 'N/A';

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

    // If first-encounter patient fields (blood_type, allergies) are provided, update patient record
    if (blood_type !== undefined || allergies !== undefined) {
      const patient = await Patient.findByPk(encounter.patient_id, { transaction });
      if (patient) {
        const updates: any = {};
        if (blood_type !== undefined && blood_type !== '') updates.blood_type = blood_type;
        if (allergies !== undefined) updates.allergies = allergies;
        if (Object.keys(updates).length > 0) {
          await patient.update(updates, { transaction });
        }
      }
    }

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

/**
 * GET /encounters/dashboard-stats
 * Returns KPI counters for today + all-time, and top 5 diagnoses.
 */
export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    const provider_id = req.user?.id;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      activeSessions, 
      completedToday, 
      allTimeCompleted, 
      diagnosisRows,
      myCompletedToday,
      recentEncounters
    ] = await Promise.all([
      Encounter.count({ where: { status: 'IN_PROGRESS' } }),
      Encounter.count({ where: { encounter_date: { [Op.gte]: today, [Op.lt]: tomorrow }, status: 'COMPLETED' } }),
      Encounter.count({ where: { status: 'COMPLETED' } }),
      Encounter.findAll({
        attributes: [
          'diagnosis',
          [fn('COUNT', col('diagnosis')), 'count']
        ],
        where: { status: 'COMPLETED', diagnosis: { [Op.not]: null, [Op.ne]: '' } },
        group: ['diagnosis'],
        order: [[literal('count'), 'DESC']],
        limit: 5,
        raw: true
      }),
      provider_id ? Encounter.count({ 
        where: { 
          provider_id, 
          status: 'COMPLETED', 
          encounter_date: { [Op.gte]: today, [Op.lt]: tomorrow } 
        } 
      }) : 0,
      provider_id ? Encounter.findAll({
        where: { provider_id, status: 'COMPLETED' },
        include: [{ 
          model: Patient, 
          as: 'Patient', 
          attributes: ['first_name', 'last_name', 'patient_id']
        }],
        order: [['encounter_date', 'DESC']],
        limit: 50
      }) : []
    ]);

    res.status(200).json({
      activeSessions,
      completedToday,
      allTimeCompleted,
      topDiagnoses: (diagnosisRows as any[]).map((r: any) => ({
        name: r.diagnosis,
        count: parseInt(r.count)
      })),
      myCompletedToday,
      recentEncounters: (() => {
        const unique: any[] = [];
        const seen = new Set();
        for (const enc of recentEncounters as any[]) {
          if (!seen.has(enc.patient_id)) {
            seen.add(enc.patient_id);
            unique.push(enc);
          }
          if (unique.length === 5) break;
        }
        return unique;
      })()
    });
  } catch (error: any) {
    console.error('Dashboard Stats Error:', error);
    res.status(500).json({ error: error.message || 'Internal server error.' });
  }
};

/**
 * GET /encounters/dpa-feed
 * Returns the 20 most recent audit log entries for security monitoring.
 */
export const getDpaFeed = async (req: AuthRequest, res: Response) => {
  try {
    const logs = await AuditLog.findAll({
      include: [
        { model: Provider, as: 'Provider', attributes: ['first_name', 'last_name'] },
        { model: Patient, as: 'Patient', attributes: ['first_name', 'last_name', 'patient_id'] }
      ],
      order: [['timestamp', 'DESC']],
      limit: 20
    });
    res.status(200).json(logs);
  } catch (error: any) {
    console.error('DPA Feed Error:', error);
    res.status(500).json({ error: error.message || 'Internal server error.' });
  }
};

export const updateDraft = async (req: AuthRequest, res: Response) => {
  const transaction = await sequelize.transaction();
  try {
    const { encounter_id } = req.params;
    const { 
      bp_systolic, bp_diastolic, temperature, weight_kg,
      chief_complaint, diagnosis, treatment_plan, prescriptions
    } = req.body;
    
    const provider_id = req.user?.id;
    if (!provider_id) throw new Error('Unauthorized');

    const encounter = await Encounter.findByPk(encounter_id, { transaction });
    if (!encounter) return res.status(404).json({ error: 'Encounter not found.' });

    // Only allow updating drafts for IN_PROGRESS encounters
    if (encounter.status !== 'IN_PROGRESS') {
      await transaction.rollback();
      return res.status(400).json({ error: 'Cannot update draft of a completed or cancelled encounter.' });
    }

    // Set patient_id for audit logger
    (req as any).patient_id = encounter.patient_id;

    await encounter.update({
      bp_systolic: bp_systolic ? parseInt(bp_systolic) : null,
      bp_diastolic: bp_diastolic ? parseInt(bp_diastolic) : null,
      temperature: temperature ? parseFloat(temperature) : null,
      weight: weight_kg ? parseFloat(weight_kg) : null,
      chief_complaint: chief_complaint || null,
      diagnosis: diagnosis || null,
      treatment_plan: treatment_plan || null
      // We do not change the status here, it stays IN_PROGRESS
    }, { transaction });

    // Update Prescriptions draft
    const hasMeds = prescriptions && Array.isArray(prescriptions);
    if (hasMeds) {
      // Clear existing draft prescriptions for this encounter
      await Prescription.destroy({ where: { encounter_id }, transaction });

      const prescriber = await Provider.findByPk(provider_id as string, { transaction });
      const prcNumber = prescriber?.prc_license_number || 'N/A';

      for (const rx of prescriptions) {
        if (rx.medication_name) {
          await Prescription.create({
            encounter_id: encounter.encounter_id,
            medication_name: rx.medication_name,
            dosage: rx.dosage,
            frequency: rx.frequency,
            duration_days: rx.duration_days || 0,
            prescriber_prc_number: prcNumber
          }, { transaction });
        }
      }
    }

    await transaction.commit();
    res.status(200).json({ message: 'Draft saved successfully.' });
  } catch (error: any) {
    await transaction.rollback();
    console.error('Update Draft Error:', error);
    res.status(500).json({ error: error.message || 'Internal server error.' });
  }
};
