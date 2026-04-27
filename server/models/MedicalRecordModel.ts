import pool from '../config/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export class MedicalRecordModel {
  static async create(recordData: any) {
    const { patient_id, provider_id, encounter_id, document_type, file_url, description } = recordData;
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO MEDICAL_RECORDS 
      (patient_id, provider_id, encounter_id, document_type, file_url, description) 
      VALUES (?, ?, ?, ?, ?, ?)`,
      [patient_id, provider_id, encounter_id || null, document_type, file_url, description]
    );
    return result;
  }

  static async findByPatient(patientId: string) {
    // Crucially: Only fetch records where soft_delete is FALSE
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT r.*, p.first_name as provider_first, p.last_name as provider_last 
       FROM MEDICAL_RECORDS r
       JOIN PROVIDERS p ON r.provider_id = p.provider_id
       WHERE r.patient_id = ? AND r.soft_delete = FALSE
       ORDER BY r.created_at DESC`,
      [patientId]
    );
    return rows;
  }

  static async softDelete(recordId: number, providerId: string) {
    // Only allow deletion if the provider owns the record or has admin rights (simplified to owner here)
    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE MEDICAL_RECORDS SET soft_delete = TRUE 
       WHERE record_id = ? AND provider_id = ?`,
      [recordId, providerId]
    );
    return result;
  }
}
