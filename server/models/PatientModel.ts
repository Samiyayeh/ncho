import pool from '../config/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export class PatientModel {
  static async findAll() {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM PATIENTS');
    return rows;
  }

  static async findById(patientId: string) {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM PATIENTS WHERE patient_id = ?',
      [patientId]
    );
    return rows[0];
  }

  static async findByEmail(email: string) {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM PATIENTS WHERE email = ?',
      [email]
    );
    return rows[0];
  }

  static async create(patientData: any) {
    const { patient_id, first_name, last_name, email, password_hash, date_of_birth, gender, contact_number, address } = patientData;
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO PATIENTS 
      (patient_id, first_name, last_name, email, password_hash, date_of_birth, gender, contact_number, address) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [patient_id, first_name, last_name, email, password_hash, date_of_birth, gender, contact_number, address]
    );
    return result;
  }
}
