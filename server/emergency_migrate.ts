import sequelize from './config/db';

async function migrate() {
  console.log('Starting manual migration (Legacy MySQL Compatible)...');
  
  const runQuery = async (query: string, description: string) => {
    try {
      await sequelize.query(query);
      console.log(`Success: ${description}`);
    } catch (e: any) {
      if (e.parent?.code === 'ER_DUP_FIELDNAME' || e.parent?.code === 'ER_TABLE_EXISTS_ERROR') {
        console.log(`Skipped: ${description} (Already exists)`);
      } else {
        console.error(`Error: ${description}`, e.message);
      }
    }
  };

  // 1. Update PROVIDERS
  await runQuery("ALTER TABLE PROVIDERS ADD COLUMN prc_license_number VARCHAR(50)", "Add prc_license_number to PROVIDERS");
  await runQuery("ALTER TABLE PROVIDERS ADD COLUMN role_type ENUM('TRIAGE_NURSE', 'PHYSICIAN', 'PHARMACIST', 'DENTIST', 'SOCIAL_WORKER') NOT NULL DEFAULT 'PHYSICIAN'", "Add role_type to PROVIDERS");

  // 2. Update ENCOUNTERS
  await runQuery("ALTER TABLE ENCOUNTERS ADD COLUMN queue_id CHAR(36)", "Add queue_id to ENCOUNTERS");
  await runQuery("ALTER TABLE ENCOUNTERS ADD COLUMN bp_systolic INT", "Add bp_systolic to ENCOUNTERS");
  await runQuery("ALTER TABLE ENCOUNTERS ADD COLUMN bp_diastolic INT", "Add bp_diastolic to ENCOUNTERS");
  await runQuery("ALTER TABLE ENCOUNTERS ADD COLUMN treatment_plan TEXT", "Add treatment_plan to ENCOUNTERS");

  // 3. Create QUEUES table
  await runQuery(`
    CREATE TABLE QUEUES (
      queue_id CHAR(36) PRIMARY KEY,
      patient_id VARCHAR(50) NOT NULL,
      queue_number VARCHAR(20) NOT NULL,
      date DATE NOT NULL,
      status ENUM('PENDING_TRIAGE', 'WAITING_FOR_PROVIDER', 'IN_CONSULTATION', 'PHARMACY', 'COMPLETED', 'REFERRED_OUT') NOT NULL DEFAULT 'PENDING_TRIAGE',
      service_type ENUM('OUTPATIENT', 'MEDICINE_DISPENSING', 'YAKAP', 'TB_DOTS', 'SOCIAL_HYGIENE', 'DENTAL', 'HEALTH_PROGRAM') NOT NULL,
      created_at DATETIME NOT NULL,
      updated_at DATETIME NOT NULL,
      FOREIGN KEY (patient_id) REFERENCES PATIENTS(patient_id) ON DELETE CASCADE
    )
  `, "Create QUEUES table");

  // 4. Create REFERRALS table
  await runQuery(`
    CREATE TABLE REFERRALS (
      referral_id INT AUTO_INCREMENT PRIMARY KEY,
      encounter_id INT NOT NULL,
      destination_facility VARCHAR(255) NOT NULL,
      reason_for_referral TEXT NOT NULL,
      status ENUM('OUTBOUND', 'RETURNED_WITH_RESULTS', 'CLOSED') NOT NULL DEFAULT 'OUTBOUND',
      created_at DATETIME NOT NULL,
      updated_at DATETIME NOT NULL,
      FOREIGN KEY (encounter_id) REFERENCES ENCOUNTERS(encounter_id) ON DELETE CASCADE
    )
  `, "Create REFERRALS table");

  console.log('Migration process finished.');
  process.exit(0);
}

migrate();
