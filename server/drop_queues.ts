import sequelize from './config/db';

async function dropQueues() {
  try {
    await sequelize.authenticate();
    console.log('Connected to DB.');
    // Temporarily disable foreign key checks, drop the table, then re-enable
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0;');
    await sequelize.query('DROP TABLE IF EXISTS queues;');
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1;');
    console.log('Successfully dropped queues table.');
    process.exit(0);
  } catch (err) {
    console.error('Failed to drop queues:', err);
    process.exit(1);
  }
}
dropQueues();
