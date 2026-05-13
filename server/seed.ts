import sequelize from './config/db';
import { Account } from './models/Account';
import { Patient } from './models/Patient';
import { Provider } from './models/Provider';
import { Encounter } from './models/Encounter';
import { Prescription } from './models/Prescription';
import { MedicalRecord } from './models/MedicalRecord';
import { AuditLog } from './models/AuditLog';
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

    // 2. Seed Patients (Account first, then Patient)
    const patientSeeds = [
      {
        email: 'john.doe@example.com',
        patient_id: 'NCH-2026-000001',
        first_name: 'John',
        last_name: 'Doe',
        date_of_birth: '1990-05-15',
        gender: 'Male',
        blood_type: 'O+',
        allergies: 'Penicillin',
        contact_number: '09171234567',
        voter_registered: true,
        household_head: true,
        chronic_conditions: 'Hypertension',
        address: '123 Naga St, Concepcion Pequeña, Naga City'
      },
      {
        email: 'jane.smith@example.com',
        patient_id: 'NCH-2026-000002',
        first_name: 'Jane',
        last_name: 'Smith',
        date_of_birth: '1985-11-22',
        gender: 'Female',
        blood_type: 'A-',
        allergies: 'Peanuts',
        contact_number: '09181234567',
        voter_registered: true,
        household_head: false,
        chronic_conditions: null,
        address: '456 Panganiban Drive, Naga City'
      },
      {
        email: 'juan.dc@example.com',
        patient_id: 'NCH-2026-000003',
        first_name: 'Juan',
        last_name: 'Dela Cruz',
        date_of_birth: '1998-01-30',
        gender: 'Male',
        blood_type: 'B+',
        contact_number: '09191234567',
        voter_registered: false,
        household_head: false,
        chronic_conditions: 'Asthma',
        address: '789 Magsaysay Ave, Naga City'
      }
    ];

    for (const p of patientSeeds) {
      const account = await Account.create({
        email: p.email,
        password_hash: passwordHash,
        role: 'patient'
      });
      const { email, ...patientData } = p;
      await Patient.create({ ...patientData, account_id: account.account_id } as any);
    }
    console.log(`${patientSeeds.length} Patients seeded.`);

    // 3. Seed Providers (Account first, then Provider)
    const providerSeeds = [
      {
        email: 'alice.walker@ncho.gov',
        provider_id: 'PRV-2026-1001',
        first_name: 'Alice',
        last_name: 'Walker',
        specialty: 'Internal Medicine',
        contact_number: '09123456781',
        prc_license_number: 'PHY-112233',
        role_type: 'PHYSICIAN'
      },
      {
        email: 'bob.ross@ncho.gov',
        provider_id: 'PRV-2026-1002',
        first_name: 'Bob',
        last_name: 'Ross',
        specialty: 'Triage & Vital Signs',
        contact_number: '09123456782',
        prc_license_number: 'NUR-445566',
        role_type: 'TRIAGE_NURSE'
      },
      {
        email: 'charlie.brown@ncho.gov',
        provider_id: 'PRV-2026-1003',
        first_name: 'Charlie',
        last_name: 'Brown',
        specialty: 'Clinical Pharmacy',
        contact_number: '09123456783',
        prc_license_number: 'PHA-778899',
        role_type: 'PHARMACIST'
      },
      {
        email: 'diana.prince@ncho.gov',
        provider_id: 'PRV-2026-1004',
        first_name: 'Diana',
        last_name: 'Prince',
        specialty: 'General Dentistry',
        contact_number: '09123456784',
        prc_license_number: 'DEN-998877',
        role_type: 'DENTIST'
      },
      {
        email: 'ethan.hunt@ncho.gov',
        provider_id: 'PRV-2026-1005',
        first_name: 'Ethan',
        last_name: 'Hunt',
        specialty: 'Community Welfare',
        contact_number: '09123456785',
        prc_license_number: 'RSW-665544',
        role_type: 'SOCIAL_WORKER'
      },
      {
        email: 'sarah.connor@ncho.gov',
        provider_id: 'PRV-2026-1006',
        first_name: 'Sarah',
        last_name: 'Connor',
        specialty: 'Program Specialist (TB/YAKAP)',
        contact_number: '09123456786',
        prc_license_number: 'SPE-223344',
        role_type: 'SPECIALIST'
      }
    ];

    for (const pr of providerSeeds) {
      const account = await Account.create({
        email: pr.email,
        password_hash: passwordHash,
        role: 'provider'
      });
      const { email, ...providerData } = pr;
      await Provider.create({ ...providerData, account_id: account.account_id } as any);
    }
    console.log(`${providerSeeds.length} Providers seeded (All roles covered).`);

    // 4. Seed Encounters (Ensure every patient has a first encounter)
    console.log('Seeding initial encounters...');
    const patientList = await Patient.findAll();
    const providerList = await Provider.findAll({ where: { role_type: 'PHYSICIAN' } });
    const doctor = providerList[0];

    for (const patient of patientList) {
      await Encounter.create({
        patient_id: patient.patient_id,
        provider_id: doctor.provider_id,
        status: 'COMPLETED',
        encounter_date: new Date(new Date().setDate(new Date().getDate() - 7)), // 7 days ago
        bp_systolic: 120,
        bp_diastolic: 80,
        heart_rate: 72,
        temperature: 36.5,
        weight: 65.0,
        chief_complaint: 'Initial checkup and health assessment.',
        diagnosis: 'Healthy / Routine Checkup',
        treatment_plan: 'Continue healthy lifestyle and balanced diet.'
      } as any);
    }
    console.log(`Initial encounters created for ${patientList.length} patients.`);

    console.log('--- Seeding Completed Successfully ---');
    console.log('Passwords for all accounts: password123');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();