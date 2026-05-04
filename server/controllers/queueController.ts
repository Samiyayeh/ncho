import { Request, Response } from 'express';
import { Queue } from '../models/Queue';
import { Patient } from '../models/Patient';
import { Encounter } from '../models/Encounter';
import { Prescription } from '../models/Prescription';
import { AuthRequest } from '../middlewares/authMiddleware';
import { Op } from 'sequelize';

export const joinQueue = async (req: AuthRequest, res: Response) => {
  try {
    const { patient_id, service_type, pre_triage_data } = req.body;
    const today = new Date().toISOString().split('T')[0];

    // 1. Service Routing Matrix Logic
    // If MEDICINE_DISPENSING, bypass Phases 2 & 3 and go directly to PHARMACY
    let initialStatus = 'PENDING_TRIAGE';
    if (service_type === 'MEDICINE_DISPENSING') {
      initialStatus = 'PHARMACY';
    }

    // 2. Generate daily sequential Queue_Number (Example: MED-001, OUT-005)
    const prefix = service_type.substring(0, 3).toUpperCase();
    const count = await Queue.count({
      where: {
        service_type,
        date: today
      }
    });

    const queue_number = `${prefix}-${(count + 1).toString().padStart(3, '0')}`;

    // 3. Database Mutation (Phase 1 Entry)
    const queue = await Queue.create({
      patient_id,
      service_type,
      queue_number,
      date: today,
      status: initialStatus,
      pre_triage_data: pre_triage_data || null
    });

    res.status(201).json({
      message: `Patient successfully joined queue. Status set to: ${initialStatus}`,
      queue
    });
  } catch (error: any) {
    console.error('Phase 1 Entry Error:', error);
    res.status(500).json({ error: error.message || 'Internal server error.' });
  }
};

export const updateQueueStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const queue = await Queue.findByPk(id as string);
    if (!queue) return res.status(404).json({ error: 'Queue record not found.' });

    await queue.update({ status });
    res.status(200).json(queue);
  } catch (error: any) {
    console.error('Error updating queue status:', error);
    res.status(500).json({ error: error.message || 'Internal server error.' });
  }
};

export const getDailyQueue = async (req: AuthRequest, res: Response) => {
  try {
    const { date, status, id } = req.query;
    const today = date || new Date().toISOString().split('T')[0];
    const userRole = req.user?.role_type; // From JWT

    const where: any = { date: today };
    if (id) {
      where.queue_id = id;
    } else {
      // --- Service Routing Matrix Enforcement ---
      if (userRole === 'PHYSICIAN') {
        where.service_type = 'OUTPATIENT';
        where.status = status || 'WAITING_FOR_PROVIDER';
      } else if (userRole === 'DENTIST') {
        where.service_type = 'DENTAL';
        where.status = status || 'WAITING_FOR_PROVIDER';
      } else if (userRole === 'SPECIALIST') {
        where.service_type = { [Op.in]: ['TB_DOTS', 'YAKAP', 'SOCIAL_HYGIENE'] };
        where.status = status || 'WAITING_FOR_PROVIDER';
      } else if (userRole === 'TRIAGE_NURSE') {
        where.status = status || 'PENDING_TRIAGE';
      } else if (userRole === 'PHARMACIST') {
        where.status = 'PHARMACY';
      } else {
        // Patients or generic users see their own date's queue (already in where.date)
        if (status) where.status = status;
      }
    }

    const queues = await Queue.findAll({
      where,
      include: [
        { model: Patient, as: 'Patient' },
        { 
          model: Encounter, 
          as: 'Encounter',
          include: [{ model: Prescription, as: 'Prescriptions' }]
        }
      ],
      order: [['created_at', 'ASC']]
    });

    res.status(200).json(queues);
  } catch (error: any) {
    console.error('Routing Engine Error:', error);
    res.status(500).json({ error: error.message || 'Internal server error.' });
  }
};
