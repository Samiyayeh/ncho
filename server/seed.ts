import sequelize from './config/db';
import { Patient } from './models/Patient';
import { Provider } from './models/Provider';
import { Encounter } from './models/Encounter';
import { Prescription } from './models/Prescription';
import { MedicalRecord } from './models/MedicalRecord';
import { AuditLog } from './models/AuditLog';
import { QrAccessToken } from './models/QrAccessToken';
import { Queue } from './models/Queue'; 
// import { Referral } from './models/Referral';
import bcrypt from 'bcrypt';

async function seed() {
  console.log('--- Starting Database Reset & Seeding ---');

  try {
    await sequelize.authenticate();
    console.log('Connected to database.');

    // 1. Reset all tables
    // This will drop tables if they exist and recreate them based on the models
    await sequelize.sync({ force: true });
    console.log('Database schema synchronized and tables reset.');

    const passwordHash = await bcrypt.hash('password123', 10);

    // 2. Seed Patients
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
        contact_number: '09171234567',
        verification_status: 'VERIFIED',
        id_type: 'PHILHEALTH',
        voter_registered: true,
        household_head: true,
        chronic_conditions: 'Hypertension',
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
        contact_number: '09181234567',
        verification_status: 'VERIFIED',
        id_type: 'PHILSYS',
        voter_registered: true,
        household_head: false,
        chronic_conditions: null,
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
        contact_number: '09191234567',
        verification_status: 'VERIFIED',
        id_type: 'PHILSYS',
        voter_registered: false,
        household_head: false,
        chronic_conditions: 'Asthma',
        address: '789 Magsaysay Ave, Naga City'
      }
    ];

    for (const p of patients) {
      await Patient.create(p as any);
    }
    console.log(`${patients.length} Patients seeded.`);

    // 3. Seed Providers (All Roles with PRC Licenses)
    const providers = [
      {
        provider_id: 'PRV-2026-1001',
        first_name: 'Alice',
        last_name: 'Walker',
        specialty: 'Internal Medicine',
        email: 'alice.walker@ncho.gov',
        password_hash: passwordHash,
        contact_number: '09123456781',
        prc_license_number: 'PHY-112233',
        role_type: 'PHYSICIAN'
      },
      {
        provider_id: 'PRV-2026-1002',
        first_name: 'Bob',
        last_name: 'Ross',
        specialty: 'Triage & Vital Signs',
        email: 'bob.ross@ncho.gov',
        password_hash: passwordHash,
        contact_number: '09123456782',
        prc_license_number: 'NUR-445566',
        role_type: 'TRIAGE_NURSE'
      },
      {
        provider_id: 'PRV-2026-1003',
        first_name: 'Charlie',
        last_name: 'Brown',
        specialty: 'Clinical Pharmacy',
        email: 'charlie.brown@ncho.gov',
        password_hash: passwordHash,
        contact_number: '09123456783',
        prc_license_number: 'PHA-778899',
        role_type: 'PHARMACIST'
      },
      {
        provider_id: 'PRV-2026-1004',
        first_name: 'Diana',
        last_name: 'Prince',
        specialty: 'General Dentistry',
        email: 'diana.prince@ncho.gov',
        password_hash: passwordHash,
        contact_number: '09123456784',
        prc_license_number: 'DEN-998877',
        role_type: 'DENTIST'
      },
      {
        provider_id: 'PRV-2026-1005',
        first_name: 'Ethan',
        last_name: 'Hunt',
        specialty: 'Community Welfare',
        email: 'ethan.hunt@ncho.gov',
        password_hash: passwordHash,
        contact_number: '09123456785',
        prc_license_number: 'RSW-665544',
        role_type: 'SOCIAL_WORKER'
      },
      {
        provider_id: 'PRV-2026-1006',
        first_name: 'Sarah',
        last_name: 'Connor',
        specialty: 'Program Specialist (TB/YAKAP)',
        email: 'sarah.connor@ncho.gov',
        password_hash: passwordHash,
        contact_number: '09123456786',
        prc_license_number: 'SPE-223344',
        role_type: 'SPECIALIST'
      }
    ];

    for (const pr of providers) {
      await Provider.create(pr as any);
    }
    console.log(`${providers.length} Providers seeded (All roles covered).`);

    console.log('--- Seeding Completed Successfully ---');
    console.log('Passwords for all accounts: password123');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();