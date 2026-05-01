import sequelize from './config/db';

async function runMigration() {
  console.log('Starting migration to add missing columns...');
  try {
    // Check if we can connect
    await sequelize.authenticate();
    console.log('Connected to database.');

    // Add account_status
    try {
      await sequelize.query("ALTER TABLE PATIENTS ADD COLUMN account_status ENUM('UNVERIFIED', 'ACTIVE') NOT NULL DEFAULT 'UNVERIFIED'");
      console.log('Added account_status column.');
    } catch (e: any) {
      if (e.parent?.code === 'ER_DUP_FIELDNAME') console.log('account_status column already exists.');
      else throw e;
    }

    // Add voter_registered
    try {
      await sequelize.query("ALTER TABLE PATIENTS ADD COLUMN voter_registered BOOLEAN DEFAULT NULL");
      console.log('Added voter_registered column.');
    } catch (e: any) {
      if (e.parent?.code === 'ER_DUP_FIELDNAME') console.log('voter_registered column already exists.');
      else throw e;
    }

    // Add household_head
    try {
      await sequelize.query("ALTER TABLE PATIENTS ADD COLUMN household_head BOOLEAN DEFAULT NULL");
      console.log('Added household_head column.');
    } catch (e: any) {
      if (e.parent?.code === 'ER_DUP_FIELDNAME') console.log('household_head column already exists.');
      else throw e;
    }

    // Add chronic_conditions
    try {
      await sequelize.query("ALTER TABLE PATIENTS ADD COLUMN chronic_conditions TEXT");
      console.log('Added chronic_conditions column.');
    } catch (e: any) {
      if (e.parent?.code === 'ER_DUP_FIELDNAME') console.log('chronic_conditions column already exists.');
      else throw e;
    }

    console.log('Migration completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
