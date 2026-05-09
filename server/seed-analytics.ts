import sequelize from './config/db';
import { Patient } from './models/Patient';
import { Provider } from './models/Provider';
import { Encounter } from './models/Encounter';
import { Prescription } from './models/Prescription';
import { MedicalRecord } from './models/MedicalRecord';
import { AuditLog } from './models/AuditLog';
import { QrAccessToken } from './models/QrAccessToken';
import bcrypt from 'bcrypt';

// Helper to get random item from array
const randomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// Helper to generate a random date within the last N days
const randomDate = (daysAgo: number) => {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo));
  return date.toISOString().split('T')[0];
};

const randomPastYear = (minAge: number, maxAge: number) => {
  const currentYear = new Date().getFullYear();
  const year = currentYear - Math.floor(Math.random() * (maxAge - minAge + 1)) - minAge;
  const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
  const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

async function seed() {
  console.log('--- Starting Analytics Seeding (150+ Records) ---');

  try {
    await sequelize.authenticate();
    console.log('Connected to database.');

    await sequelize.sync({ force: true });
    console.log('Database schema synchronized and tables reset.');

    const passwordHash = await bcrypt.hash('password123', 10);

    // 1. Seed Providers
    const providers = [
      {
        provider_id: 'PRV-2026-1001',
        first_name: 'Alice', last_name: 'Walker',
        specialty: 'Internal Medicine',
        email: 'alice.walker@ncho.gov', password_hash: passwordHash,
        contact_number: '09123456781', prc_license_number: 'PHY-112233', role_type: 'PHYSICIAN'
      },
      {
        provider_id: 'PRV-2026-1002',
        first_name: 'Bob', last_name: 'Ross',
        specialty: 'Triage & Vital Signs',
        email: 'bob.ross@ncho.gov', password_hash: passwordHash,
        contact_number: '09123456782', prc_license_number: 'NUR-445566', role_type: 'TRIAGE_NURSE'
      },
      {
        provider_id: 'PRV-2026-1003',
        first_name: 'Charlie', last_name: 'Brown',
        specialty: 'Clinical Pharmacy',
        email: 'charlie.brown@ncho.gov', password_hash: passwordHash,
        contact_number: '09123456783', prc_license_number: 'PHA-778899', role_type: 'PHARMACIST'
      },
      {
        provider_id: 'PRV-2026-1004',
        first_name: 'Diana', last_name: 'Prince',
        specialty: 'General Dentistry',
        email: 'diana.prince@ncho.gov', password_hash: passwordHash,
        contact_number: '09123456784', prc_license_number: 'DEN-998877', role_type: 'DENTIST'
      },
      {
        provider_id: 'PRV-2026-1006',
        first_name: 'Sarah', last_name: 'Connor',
        specialty: 'Program Specialist (TB/YAKAP)',
        email: 'sarah.connor@ncho.gov', password_hash: passwordHash,
        contact_number: '09123456786', prc_license_number: 'SPE-223344', role_type: 'SPECIALIST'
      }
    ];

    for (const pr of providers) {
      await Provider.create(pr as any);
    }
    console.log('Providers seeded.');

    // Arrays for random generation
    const firstNames = ['John', 'Jane', 'Michael', 'Emily', 'Chris', 'Sarah', 'David', 'Jessica', 'Daniel', 'Ashley', 'Matthew', 'Amanda', 'Andrew', 'Brittany', 'Joshua', 'Samantha', 'James', 'Elizabeth', 'Robert', 'Megan'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Jones', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor', 'Anderson', 'Thomas', 'Jackson', 'White', 'Harris', 'Martin', 'Thompson', 'Garcia', 'Martinez', 'Robinson'];
    const genders = ['Male', 'Female'];
    const encounterStatuses = ['COMPLETED', 'COMPLETED', 'COMPLETED', 'IN_PROGRESS'];

    let encounterCounter = 1;
    const NUM_PATIENTS = 150;

    // We want some data to specifically be TODAY
    const todayStr = new Date().toISOString().split('T')[0];

    console.log(`Generating ${NUM_PATIENTS} patients and their queues...`);

    for (let i = 1; i <= NUM_PATIENTS; i++) {
      const pId = `NCH-2026-${i.toString().padStart(6, '0')}`;
      const fName = randomItem(firstNames);
      const lName = randomItem(lastNames);
      const isMale = randomItem(genders) === 'Male';
      
      const patient = await Patient.create({
        patient_id: pId,
        first_name: fName,
        last_name: lName,
        email: `${fName.toLowerCase()}.${lName.toLowerCase()}${i}@example.com`,
        password_hash: passwordHash,
        date_of_birth: randomPastYear(5, 80), // Ages 5 to 80
        gender: isMale ? 'Male' : 'Female',
        blood_type: randomItem(['O+', 'A+', 'B+', 'AB+', 'O-', 'A-', 'B-', 'AB-']),
        contact_number: `091${Math.floor(10000000 + Math.random() * 90000000)}`,
        voter_registered: Math.random() > 0.3,
        household_head: Math.random() > 0.7,
        address: `${Math.floor(Math.random() * 999) + 1} Random St, Naga City`
      } as any);

      // Generate 1 to 3 encounters for this patient
      const numEncounters = Math.floor(Math.random() * 3) + 1;
      for (let j = 0; j < numEncounters; j++) {
        const eStatus = randomItem(encounterStatuses);
        
        // 20% chance the encounter is for TODAY, otherwise past 30 days
        const eDate = Math.random() > 0.8 ? todayStr : randomDate(30);
        encounterCounter++;

        const encounter = await Encounter.create({
          patient_id: pId,
          provider_id: randomItem(providers).provider_id,
          encounter_date: new Date(eDate),
          chief_complaint: 'Routine checkup / Generated complaint',
          diagnosis: 'Healthy',
          treatment_plan: 'Rest and hydration',
          status: eStatus
        } as any);

        if (eStatus === 'COMPLETED') {
          await MedicalRecord.create({
            patient_id: pId,
            provider_id: encounter.provider_id,
            encounter_id: encounter.encounter_id,
            document_type: 'Consultation Note',
            file_url: 'http://example.com/medical_record_mock.pdf',
            description: 'Completed consultation record.',
          });

          await AuditLog.create({
            provider_id: encounter.provider_id,
            patient_id: pId,
            action_taken: 'VIEWED_MEDICAL_RECORD',
            ip_address: '127.0.0.1',
            timestamp: new Date(eDate)
          });

          await AuditLog.create({
            provider_id: encounter.provider_id,
            patient_id: pId,
            action_taken: 'COMPLETED_ENCOUNTER',
            ip_address: '127.0.0.1',
            timestamp: new Date(eDate)
          });
        }
      }
    }

    console.log(`Seeding complete. Inserted ${NUM_PATIENTS} patients and ${encounterCounter - 1} encounters.`);
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();
