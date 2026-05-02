import sequelize from './config/db';
import { Patient } from './models/Patient';
import { Provider } from './models/Provider';
import { Encounter } from './models/Encounter';
import { Prescription } from './models/Prescription';
import { MedicalRecord } from './models/MedicalRecord';
import { AuditLog } from './models/AuditLog';
import { QrAccessToken } from './models/QrAccessToken';
import bcrypt from 'bcrypt';

async function seed() {
  console.log('--- Starting Database Reset & Seeding ---');

  try {
    await sequelize.authenticate();
    console.log('Connected to database.');

    // 1. Clear all data
    // We disable foreign key checks to truncate all tables safely
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    await Prescription.truncate();
    await MedicalRecord.truncate();
    await Encounter.truncate();
    await AuditLog.truncate();
    await QrAccessToken.truncate();
    await Patient.truncate();
    await Provider.truncate();
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('All tables cleared.');

    const passwordHash = await bcrypt.hash('password123', 10);

    // 2. Seed Patients (Verified/ACTIVE)
    const patients = [
      {
        patient_id: 'NCH-2026-000001',
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        password_hash: passwordHash,
        date_of_birth: '1990-05-15',
        gender: 'Male',
        blood_type: 'O+',
        allergies: 'Penicillin',
        account_status: 'ACTIVE',
        voter_registered: true,
        household_head: true,
        address: '123 Naga St, Concepcion Pequeña, Naga City'
      },
      {
        patient_id: 'NCH-2026-000002',
        first_name: 'Jane',
        last_name: 'Smith',
        email: 'jane.smith@example.com',
        password_hash: passwordHash,
        date_of_birth: '1985-11-22',
        gender: 'Female',
        blood_type: 'A-',
        allergies: 'Peanuts',
        account_status: 'ACTIVE',
        voter_registered: true,
        household_head: false,
        address: '456 Panganiban Drive, Naga City'
      },
      {
        patient_id: 'NCH-2026-000003',
        first_name: 'Juan',
        last_name: 'Dela Cruz',
        email: 'juan.dc@example.com',
        password_hash: passwordHash,
        date_of_birth: '1998-01-30',
        gender: 'Male',
        blood_type: 'B+',
        account_status: 'ACTIVE',
        voter_registered: false,
        household_head: false,
        address: '789 Magsaysay Ave, Naga City'
      }
    ];

    for (const p of patients) {
      await Patient.create(p as any);
    }
    console.log('3 Patients seeded.');

    // 3. Seed Providers
    const providers = [
      {
        provider_id: 'PRV-2026-1001',
        first_name: 'Alice',
        last_name: 'Walker',
        specialty: 'Cardiology',
        email: 'alice.walker@ncho.gov',
        password_hash: passwordHash,
        contact_number: '09123456789'
      },
      {
        provider_id: 'PRV-2026-1002',
        first_name: 'Bob',
        last_name: 'Ross',
        specialty: 'General Practice',
        email: 'bob.ross@ncho.gov',
        password_hash: passwordHash,
        contact_number: '09987654321'
      },
      {
        provider_id: 'PRV-2026-1003',
        first_name: 'Charlie',
        last_name: 'Brown',
        specialty: 'Pediatrics',
        email: 'charlie.brown@ncho.gov',
        password_hash: passwordHash,
        contact_number: '09456123789'
      }
    ];

    for (const pr of providers) {
      await Provider.create(pr as any);
    }
    console.log('3 Providers seeded.');

    console.log('--- Seeding Completed Successfully ---');
    console.log('Passwords for all accounts: password123');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();
