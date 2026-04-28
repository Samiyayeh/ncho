import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import sequelize, { testConnection } from './config/db';
import path from 'path';

import authRoutes from './routes/authRoutes';
import patientRoutes from './routes/patientRoutes';
import providerRoutes from './routes/providerRoutes';

dotenv.config();

const app = express();
const port = Number(process.env.PORT) || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (Uploaded Medical Records)
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/patient', patientRoutes);
app.use('/api/provider', providerRoutes);

// Basic route for testing
app.get('/', (req: Request, res: Response) => {
  res.send('NCHO Patient-Link API is running.');
});

// Start server
const startServer = async () => {
  await testConnection();
    // Synchronize Sequelize models with the database
    // Temporarily enabling alter: true for Phase 8 DB update
    await sequelize.sync({ alter: true });
  console.log('Sequelize models synchronized with the database.');

 app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on network IP and port ${port}`);
});
};

startServer();
// restart-050418
