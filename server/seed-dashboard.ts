import sequelize from './config/db';
import { Account } from './models/Account';
import { Patient } from './models/Patient';
import { Provider } from './models/Provider';
import { Encounter } from './models/Encounter';
import { Prescription } from './models/Prescription';
import { AuditLog } from './models/AuditLog';
import bcrypt from 'bcrypt';

// Helper to get random item from array
const randomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// Helper to generate a random date within the last N days
const randomDate = (daysAgo: number) => {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo));
  return date;
};

const randomPastYear = (minAge: number, maxAge: number) => {
  const currentYear = new Date().getFullYear();
  const year = currentYear - Math.floor(Math.random() * (maxAge - minAge + 1)) - minAge;
  const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
  const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

async function seed() {
  console.log('--- Starting Dashboard Seeding (100+ Realistic Records) ---');

  try {
    await sequelize.authenticate();
    console.log('Connected to database.');

    await sequelize.sync({ force: true });
    console.log('Database schema synchronized and tables reset.');

    const passwordHash = await bcrypt.hash('password123', 10);

    // 1. Seed Providers (Account first, then Provider)
    const providerSeeds = [
      {
        email: 'alice.walker@ncho.gov',
        provider_id: 'PRV-2026-1001',
        first_name: 'Alice', last_name: 'Walker',
        specialty: 'Internal Medicine',
        contact_number: '09123456781', prc_license_number: 'PHY-112233', role_type: 'PHYSICIAN'
      },
      {
        email: 'bob.ross@ncho.gov',
        provider_id: 'PRV-2026-1002',
        first_name: 'Bob', last_name: 'Ross',
        specialty: 'Clinical Staff',
        contact_number: '09123456782', prc_license_number: 'NUR-445566', role_type: 'TRIAGE_NURSE'
      },
      {
        email: 'charlie.brown@ncho.gov',
        provider_id: 'PRV-2026-1003',
        first_name: 'Charlie', last_name: 'Brown',
        specialty: 'Clinical Pharmacy',
        contact_number: '09123456783', prc_license_number: 'PHA-778899', role_type: 'PHARMACIST'
      }
    ];

    const providers: any[] = [];
    for (const pr of providerSeeds) {
      const account = await Account.create({
        email: pr.email,
        password_hash: passwordHash,
        role: 'provider'
      });
      const { email, ...providerData } = pr;
      const provider = await Provider.create({ ...providerData, account_id: account.account_id } as any);
      providers.push(provider);
    }
    console.log('Providers seeded.');

    // Arrays for random generation
    const firstNames = ['John', 'Jane', 'Michael', 'Emily', 'Chris', 'Sarah', 'David', 'Jessica', 'Daniel', 'Ashley', 'Matthew', 'Amanda', 'Andrew', 'Brittany', 'Joshua', 'Samantha', 'James', 'Elizabeth', 'Robert', 'Megan', 'Kevin', 'Laura', 'Ryan', 'Michelle', 'Justin', 'Stephanie'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Jones', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor', 'Anderson', 'Thomas', 'Jackson', 'White', 'Harris', 'Martin', 'Thompson', 'Garcia', 'Martinez', 'Robinson', 'Clark', 'Rodriguez', 'Lewis', 'Lee', 'Walker'];
    const diagnoses = ['Essential Hypertension', 'Common Cold', 'Acute Gastritis', 'Type 2 Diabetes Mellitus', 'Urinary Tract Infection', 'Acute Pharyngitis', 'Lower Back Pain', 'Bronchial Asthma', 'Tension Headache', 'Dermatitis'];
    const actions = ['ACCESSED_PATIENT_RECORD', 'VIEWED_MEDICAL_HISTORY', 'STARTED_ENCOUNTER', 'COMPLETED_ENCOUNTER', 'PRESCRIBED_MEDICATION'];

    const NUM_PATIENTS = 80;
    const TOTAL_ENCOUNTERS = 100;
    const patients: any[] = [];

    console.log(`Generating ${NUM_PATIENTS} patients...`);

    for (let i = 1; i <= NUM_PATIENTS; i++) {
      const pId = `NCH-2026-${i.toString().padStart(6, '0')}`;
      const fName = randomItem(firstNames);
      const lName = randomItem(lastNames);
      const patientEmail = `${fName.toLowerCase()}.${lName.toLowerCase()}${i}@example.com`;
      
      const account = await Account.create({
        email: patientEmail,
        password_hash: passwordHash,
        role: 'patient'
      });

      const p = await Patient.create({
        patient_id: pId,
        account_id: account.account_id,
        first_name: fName,
        last_name: lName,
        date_of_birth: randomPastYear(5, 80),
        gender: i % 2 === 0 ? 'Male' : 'Female',
        blood_type: randomItem(['O+', 'A+', 'B+', 'AB+', 'O-', 'A-', 'B-', 'AB-']),
        contact_number: `091${Math.floor(10000000 + Math.random() * 90000000)}`,
        voter_registered: true,
        household_head: i % 5 === 0,
        address: `${Math.floor(Math.random() * 999) + 1} Main St, Naga City`,
      } as any);
      patients.push(p);
    }

    console.log(`Generating ${TOTAL_ENCOUNTERS} encounters...`);

    const today = new Date();
    
    // We want each provider to have some encounters today to show progress
    for (let i = 0; i < TOTAL_ENCOUNTERS; i++) {
      let eDate: Date;
      let pId: string;
      let provId: string;

      if (i < providers.length * 5) {
        // First few encounters: ensure every provider gets 5 today
        const pIdx = Math.floor(i / 5);
        provId = providers[pIdx].provider_id;
        eDate = today;
        pId = patients[i].patient_id;
      } else {
        // Remainder: random distribution over the last 30 days
        eDate = randomDate(30);
        pId = randomItem(patients).patient_id;
        provId = randomItem(providers).provider_id;
      }

      const encounter = await Encounter.create({
        patient_id: pId,
        provider_id: provId,
        encounter_date: eDate,
        chief_complaint: 'Patient presented with seasonal symptoms.',
        diagnosis: randomItem(diagnoses),
        treatment_plan: 'Follow-up in 1 week if symptoms persist.',
        status: 'COMPLETED'
      } as any);

      // Add a prescription for 50% of encounters
      if (Math.random() > 0.5) {
        await Prescription.create({
          encounter_id: encounter.encounter_id,
          medication_name: randomItem(['Paracetamol', 'Amoxicillin', 'Metformin', 'Amlodipine', 'Cetirizine']),
          dosage: '500mg',
          frequency: 'BID',
          duration_days: 7,
          prescriber_prc_number: 'PHY-112233'
        } as any);
      }

      // Add audit logs for each encounter to populate the security feed
      await AuditLog.create({
        provider_id: provId,
        patient_id: pId,
        action_taken: randomItem(actions),
        ip_address: `192.168.1.${Math.floor(Math.random() * 254) + 1}`,
        timestamp: eDate
      });
    }

    console.log('Seeding complete. Use "npm run seed:dashboard" to populate with these records.');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();

