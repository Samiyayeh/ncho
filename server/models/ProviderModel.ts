import pool from '../config/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export class ProviderModel {
  static async findAll() {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM PROVIDERS');
    return rows;
  }

  static async findById(providerId: string) {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM PROVIDERS WHERE provider_id = ?',
      [providerId]
    );
    return rows[0];
  }

  static async findByEmail(email: string) {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM PROVIDERS WHERE email = ?',
      [email]
    );
    return rows[0];
  }

  static async create(providerData: any) {
    const { provider_id, first_name, last_name, specialty, email, password_hash, contact_number } = providerData;
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO PROVIDERS 
      (provider_id, first_name, last_name, specialty, email, password_hash, contact_number) 
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [provider_id, first_name, last_name, specialty, email, password_hash, contact_number]
    );
    return result;
  }
}
