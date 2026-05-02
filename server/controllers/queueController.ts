import { Request, Response } from 'express';
import { Queue } from '../models/Queue';
import { Patient } from '../models/Patient';
import { Encounter } from '../models/Encounter';
import { Prescription } from '../models/Prescription';
import { AuthRequest } from '../middlewares/authMiddleware';
import { Op } from 'sequelize';

export const joinQueue = async (req: AuthRequest, res: Response) => {
  try {
    const { patient_id, service_type } = req.body;
    const today = new Date().toISOString().split('T')[0];

    // Generate daily sequential Queue_Number
    // Example: MED-001, DEN-005
    const prefix = service_type.substring(0, 3).toUpperCase();
    const count = await Queue.count({
      where: {
        service_type,
        date: today
      }
    });

    const queue_number = `${prefix}-${(count + 1).toString().padStart(3, '0')}`;

    const queue = await Queue.create({
      patient_id,
      service_type,
      queue_number,
      date: today,
      status: 'PENDING_TRIAGE',
      pre_triage_data: req.body.pre_triage_data || null
    });

    res.status(201).json(queue);
  } catch (error: any) {
    console.error('Error joining queue:', error);
    res.status(500).json({ error: error.message || 'Internal server error.' });
  }
};

export const updateQueueStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const queue = await Queue.findByPk(id);
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
    const { date, serviceType, status, id } = req.query;
    const today = date || new Date().toISOString().split('T')[0];

    const where: any = {};
    if (id) {
      where.queue_id = id;
    } else {
      where.date = today;
      if (serviceType) where.service_type = serviceType;
      if (status) where.status = status;
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
    console.error('Error fetching queue:', error);
    res.status(500).json({ error: error.message || 'Internal server error.' });
  }
};
