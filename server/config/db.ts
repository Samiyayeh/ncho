import { Sequelize } from 'sequelize-typescript';
import dotenv from 'dotenv';
import path from 'path';

// Load env variables
dotenv.config({
  path: process.env.NODE_ENV === 'test' 
    ? path.join(__dirname, '../.env.test') 
    : path.join(__dirname, '../.env')
});

// We initialize Sequelize and automatically load all models from the models directory.
const sequelize = new Sequelize({
  dialect: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ncho_patient_link',
  models: [path.join(__dirname, '../models')], // Auto-load models
  logging: false, // Set to console.log to see SQL queries
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

// Test connection function
export const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Successfully connected to the MySQL database via Sequelize.');
    // In dev, we can sync models, but be careful in production!
    // await sequelize.sync({ alter: true });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

export default sequelize;
