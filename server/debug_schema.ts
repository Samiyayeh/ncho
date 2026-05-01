import sequelize from './config/db';

async function checkSchema() {
  try {
    const [results] = await sequelize.query('DESCRIBE ENCOUNTERS');
    console.log('ENCOUNTERS Table Schema:');
    console.table(results);
    process.exit(0);
  } catch (error) {
    console.error('Error checking schema:', error);
    process.exit(1);
  }
}

checkSchema();
