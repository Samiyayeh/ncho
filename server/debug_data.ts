import sequelize from './config/db';

async function checkData() {
  try {
    const [results] = await sequelize.query('SELECT * FROM ENCOUNTERS');
    console.log('ENCOUNTERS Data:');
    console.table(results);
    process.exit(0);
  } catch (error) {
    console.error('Error checking data:', error);
    process.exit(1);
  }
}

checkData();
