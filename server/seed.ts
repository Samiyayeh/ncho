import sequelize from './config/db';
import { Account } from './models/Account';
import { Patient } from './models/Patient';
import { Provider } from './models/Provider';
import { Encounter } from './models/Encounter';
import { Prescription } from './models/Prescription';
import { MedicalRecord } from './models/MedicalRecord';
import { AuditLog } from './models/AuditLog';
import bcrypt from 'bcrypt';
import fs from 'fs';
import path from 'path';
import http from 'http';
import https from 'https';

const downloadFile = (url: string, dest: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const dir = path.dirname(dest);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const file = fs.createWriteStream(dest);
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    };

    const client = url.startsWith('https') ? https : http;

    client.get(url, options, (response) => {
      // Handle redirect
      if (response.statusCode && response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        const redirectUrl = response.headers.location.startsWith('http')
          ? response.headers.location
          : new URL(response.headers.location, url).toString();
        
        file.close();
        fs.unlink(dest, () => {
          downloadFile(redirectUrl, dest).then(resolve).catch(reject);
        });
        return;
      }
      if (response.statusCode !== 200) {
        file.close();
        fs.unlink(dest, () => {});
        reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
        return;
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      file.close();
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
};

const randomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

async function seed() {
  console.log('--- 🚀 Starting Realistic Demo Seeding ---');

  try {
    await sequelize.authenticate();
    console.log('Connected to database.');

    // 1. Reset all tables
    await sequelize.sync({ force: true });
    console.log('Database schema reset and synchronized.');

    const passwordHash = await bcrypt.hash('password123', 10);

    // 2. Seed Providers (Primary Demo Doctor is Alice Walker)
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
      }
    ];

    const providers: any[] = [];
    for (const pr of providerSeeds) {
      const account = await Account.create({
        email: pr.email,
        password_hash: passwordHash,
        role: 'provider'
      });
      const provider = await Provider.create({ ...pr, account_id: account.account_id } as any);
      providers.push(provider);
    }
    const drAlice = providers[0];
    console.log('✅ Providers seeded.');

    // 3. Seed "Star" Patients with specific histories
    const starPatients = [
      {
        email: 'john.doe@example.com',
        patient_id: 'NCH-2026-000001',
        first_name: 'John',
        last_name: 'Doe',
        date_of_birth: '1982-03-12',
        gender: 'Male',
        blood_type: 'O+',
        allergies: 'Aspirin, Shellfish',
        contact_number: '0917-555-0101',
        address: 'Blk 12 Lot 4, San Felipe, Naga City',
        chronic_conditions: 'Hypertension, Type 2 Diabetes'
      },
      {
        email: 'jane.smith@example.com',
        patient_id: 'NCH-2026-000002',
        first_name: 'Jane',
        last_name: 'Smith',
        date_of_birth: '1995-07-24',
        gender: 'Female',
        blood_type: 'A-',
        allergies: 'None',
        contact_number: '0918-555-0102',
        address: '15A Panganiban Drive, Naga City',
        chronic_conditions: 'Asthma'
      },
      {
        email: 'sam.dela@example.com',
        patient_id: 'NCH-2026-000003',
        first_name: 'Sam',
        last_name: 'Dela Cruz',
        date_of_birth: '1990-01-15',
        gender: 'Male',
        blood_type: 'B+',
        allergies: 'Peanuts',
        contact_number: '0919-555-0103',
        address: 'Concepcion Pequeña, Naga City',
        chronic_conditions: 'None'
      }
    ];

    for (const sp of starPatients) {
      const account = await Account.create({
        email: sp.email,
        password_hash: passwordHash,
        role: 'patient'
      });
      const { email, ...pData } = sp;
      await Patient.create({ ...pData, account_id: account.account_id } as any);
    }
    console.log('✅ Star Patients seeded.');

    // 4. Seed Random Patients for variety
    const fNames = ['Michael', 'Sarah', 'David', 'Jessica', 'Emily', 'Chris', 'Daniel', 'Maria', 'Jose', 'Elena', 'Antonio', 'Teresa'];
    const lNames = ['Garcia', 'Martinez', 'Reyes', 'Lopez', 'Santos', 'Cruz', 'Bautista', 'Torres', 'Perez', 'Gonzales'];
    
    for (let i = 1; i <= 25; i++) {
      const f = randomItem(fNames);
      const l = randomItem(lNames);
      const pid = `NCH-2026-100${i.toString().padStart(3, '0')}`;
      const email = `${f.toLowerCase()}.${l.toLowerCase()}${i}@demo.local`;

      const account = await Account.create({
        email,
        password_hash: passwordHash,
        role: 'patient'
      });

      await Patient.create({
        patient_id: pid,
        account_id: account.account_id,
        first_name: f,
        last_name: l,
        date_of_birth: `19${Math.floor(Math.random()*40+50)}-${Math.floor(Math.random()*11+1).toString().padStart(2,'0')}-${Math.floor(Math.random()*27+1).toString().padStart(2,'0')}`,
        gender: Math.random() > 0.5 ? 'Male' : 'Female',
        blood_type: randomItem(['A+', 'B+', 'AB+', 'O+', 'A-', 'B-', 'O-']),
        contact_number: `09${Math.floor(100000000 + Math.random()*900000000)}`,
        address: `${Math.floor(Math.random()*100+1)} Brgy. Triangulo, Naga City`
      } as any);
    }
    console.log('✅ 25 Random Patients seeded.');

    // 5. Seed Realistic "Top 5" Diagnoses and Clinical History
    console.log('⌛ Seeding realistic clinical history for analytics...');
    
    const commonDiagnoses = [
      { diag: 'Essential Hypertension', comp: 'Regular BP monitoring', plan: 'Continue maintenance meds, low salt diet.' },
      { diag: 'Acute Upper Respiratory Infection', comp: 'Cough, colds, and slight fever', plan: 'Rest, increased fluid intake, and paracetamol if needed.' },
      { diag: 'Type 2 Diabetes Mellitus', comp: 'Routine blood sugar check', plan: 'Maintain glucose monitoring and diabetic diet.' },
      { diag: 'Acute Gastritis', comp: 'Stomach pain and acid reflux', plan: 'Avoid spicy food, take antacids as prescribed.' },
      { diag: 'Urinary Tract Infection', comp: 'Painful urination', plan: 'Finish course of antibiotics, increase water intake.' },
      { diag: 'Acute Bronchitis', comp: 'Persistent cough and chest congestion', plan: 'Nebulization and rest.' },
      { diag: 'Dengue Fever (Probable)', comp: 'High fever and joint pain', plan: 'Admitted for monitoring and hydration.' }
    ];

    const allPatients = await Patient.findAll();
    
    // Create ~60 random encounters across all patients to build realistic analytics
    for (let i = 0; i < 60; i++) {
      const patient = randomItem(allPatients);
      const provider = randomItem(providers);
      
      // Weight the diagnoses so top 5 emerge clearly
      let diagnosisData;
      const rand = Math.random();
      if (rand < 0.3) diagnosisData = commonDiagnoses[0]; // Hypertension (30%)
      else if (rand < 0.5) diagnosisData = commonDiagnoses[1]; // URI (20%)
      else if (rand < 0.65) diagnosisData = commonDiagnoses[2]; // Diabetes (15%)
      else if (rand < 0.75) diagnosisData = commonDiagnoses[3]; // Gastritis (10%)
      else if (rand < 0.85) diagnosisData = commonDiagnoses[4]; // UTI (10%)
      else diagnosisData = commonDiagnoses[Math.floor(Math.random() * (commonDiagnoses.length - 5)) + 5];

      await Encounter.create({
        patient_id: patient.patient_id,
        provider_id: provider.provider_id,
        encounter_date: new Date(Date.now() - Math.random() * 30 * 24 * 3600000), // Within last 30 days
        status: 'COMPLETED',
        bp_systolic: 110 + Math.floor(Math.random() * 40),
        bp_diastolic: 70 + Math.floor(Math.random() * 25),
        heart_rate: 65 + Math.floor(Math.random() * 25),
        temperature: 36.2 + Math.random() * 1.5,
        weight: 50 + Math.random() * 40,
        chief_complaint: diagnosisData.comp,
        diagnosis: diagnosisData.diag,
        treatment_plan: diagnosisData.plan,
        encounter_type: 'CONSULTATION'
      } as any);
    }

    // Specific "Star" Patients Histories (Already fine, but keeping them)
    console.log('⭐ Seeding star patient deep-dives...');
    
    // John Doe's History (Hypertension management)
    const johnHistory = [
      { date: new Date('2026-01-10'), bp: '150/95', hr: 88, temp: 36.6, weight: 82.5, diag: 'Essential Hypertension', comp: 'Frequent headaches and dizziness', notes: 'Patient advised to reduce sodium intake.' },
      { date: new Date('2026-03-05'), bp: '140/90', hr: 82, temp: 36.5, weight: 81.0, diag: 'Hypertension - Improving', comp: 'Follow-up on blood pressure', notes: 'BP is lowering. Medication working well.' },
      { date: new Date('2026-05-15'), bp: '130/85', hr: 75, temp: 36.7, weight: 79.8, diag: 'Hypertension - Controlled', comp: 'Routine maintenance check', notes: 'Weight loss observed. Continue current dosage.' }
    ];

    for (const h of johnHistory) {
      const [sys, dia] = h.bp.split('/').map(Number);
      const enc = await Encounter.create({
        patient_id: 'NCH-2026-000001',
        provider_id: drAlice.provider_id,
        encounter_date: h.date,
        status: 'COMPLETED',
        bp_systolic: sys,
        bp_diastolic: dia,
        heart_rate: h.hr,
        temperature: h.temp,
        weight: h.weight,
        chief_complaint: h.comp,
        diagnosis: h.diag,
        treatment_plan: h.notes,
        encounter_type: 'CONSULTATION'
      } as any);

      await Prescription.create({
        encounter_id: enc.encounter_id,
        medication_name: 'Amlodipine Besylate',
        dosage: '5mg',
        frequency: 'Once a day',
        duration_days: 30,
        prescriber_prc_number: drAlice.prc_license_number
      });
    }

    // Sam Dela's History (Multiple recent visits - Testing Deduplication)
    // We want 3 visits TODAY to test the dashboard deduplication
    const samHistory = [
      { date: new Date(), time: '08:04 AM', diag: 'Common Cold', comp: 'Sneezing and runny nose' },
      { date: new Date(), time: '09:21 AM', diag: 'Mild Allergy', comp: 'Skin rash after lunch' },
      { date: new Date(), time: '12:23 PM', diag: 'Follow-up Assessment', comp: 'Reviewing progress' }
    ];

    for (const h of samHistory) {
      const d = new Date(h.date);
      // Hack to set different times for same day
      const [hh, mm] = h.time.split(':').map(s => parseInt(s));
      d.setHours(hh + (h.time.includes('PM') && hh < 12 ? 12 : 0), mm);

      await Encounter.create({
        patient_id: 'NCH-2026-000003',
        provider_id: drAlice.provider_id,
        encounter_date: d,
        status: 'COMPLETED',
        bp_systolic: 120,
        bp_diastolic: 80,
        heart_rate: 70,
        temperature: 36.5,
        weight: 70,
        chief_complaint: h.comp,
        diagnosis: h.diag,
        treatment_plan: 'Rest and fluids.',
        encounter_type: 'CONSULTATION'
      } as any);
    }

    // Download sample files locally to uploads/ for offline clinical demonstration
    console.log('⌛ Downloading realistic clinical files to local uploads folder...');
    const localJpgPath = path.join(__dirname, 'uploads', 'sample-xray.jpg');

    let johnFileUrl = 'https://knect365.imgix.net/uploads/bd64cf28-498e-44df-be77-3e74cd079783-featured-49f3a3c3ecd5bdb5a10037c1b80de2ff.jpg?auto=format&fit=max&w=1920&dpr=1';

    try {
      await downloadFile(johnFileUrl, localJpgPath);
      console.log('✅ Downloaded local sample-xray.jpg');
      johnFileUrl = '/uploads/sample-xray.jpg';
    } catch (e) {
      console.warn('⚠️ Could not download X-Ray, falling back to external link:', e);
    }

    // John Doe - File Upload Demo (Image)
    const johnDocEnc = await Encounter.create({
      patient_id: 'NCH-2026-000001',
      provider_id: drAlice.provider_id,
      encounter_date: new Date(Date.now() - 3600000 * 24 * 2), // 2 days ago
      status: 'COMPLETED',
      encounter_type: 'FILE_UPLOAD',
      diagnosis: 'Imaging: Chest X-Ray',
      chief_complaint: 'Routine Thoracic Scan'
    } as any);

    await MedicalRecord.create({
      patient_id: 'NCH-2026-000001',
      provider_id: drAlice.provider_id,
      encounter_id: johnDocEnc.encounter_id,
      document_type: 'X-Ray Image',
      file_url: johnFileUrl, 
      description: 'Standard Posteroanterior (PA) view chest radiograph. Clear lung fields, normal cardiothoracic ratio.'
    });

    // 6. Seed Audit Logs for privacy demo
    const actions = [
      'Accessed Patient Record',
      'Started Clinical Encounter',
      'Completed Consultation',
      'Viewed Prescription Details',
      'Downloaded Medical Certificate',
      'Modified Patient Profile'
    ];

    for (let i = 0; i < 15; i++) {
      await AuditLog.create({
        provider_id: drAlice.provider_id,
        patient_id: randomItem(starPatients).patient_id,
        action_taken: randomItem(actions),
        endpoint_accessed: `/api/v1/clinical/${Math.floor(Math.random()*100)}`,
        ip_address: '192.168.1.45',
        timestamp: new Date(Date.now() - Math.random() * 3600000 * 24) // Random time in last 24h
      });
    }

    console.log('✅ Audit Logs seeded.');
    console.log('--- 🏁 Seeding Completed Successfully ---');
    console.log('Default Password: password123');
    console.log('Demo Provider: alice.walker@ncho.gov');
    console.log('Demo Patients: john.doe@example.com, jane.smith@example.com, sam.dela@example.com');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seed();