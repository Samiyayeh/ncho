import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Patient } from '../models/Patient';
import { Provider } from '../models/Provider';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_change_me';

export const registerPatient = async (req: Request, res: Response) => {
  try {
    const { first_name, last_name, email, password, date_of_birth, gender, contact_number, address } = req.body;

    const existingPatient = await Patient.findOne({ where: { email } });
    if (existingPatient) {
      return res.status(400).json({ error: 'Email already registered.' });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const patient_id = `NCH-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    await Patient.create({
      patient_id, first_name, last_name, email, password_hash, date_of_birth, gender, contact_number, address
    });

    res.status(201).json({ message: 'Patient registered successfully', patient_id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password, role } = req.body; // role: 'patient' or 'provider'

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    let user;
    if (role === 'patient') {
      user = await Patient.findOne({ where: { email } });
    } else if (role === 'provider') {
      user = await Provider.findOne({ where: { email } });
    } else {
      return res.status(400).json({ error: 'Invalid role specified.' });
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    console.log(`Login attempt for ${email}. Password hash exists: ${!!user.password_hash}`);

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const userId = role === 'patient' ? (user as Patient).patient_id : (user as Provider).provider_id;
    const token = jwt.sign({ id: userId, role }, JWT_SECRET, { expiresIn: '8h' });

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: userId,
        first_name: user.first_name,
        last_name: user.last_name,
        role,
        role_type: (user as any).role_type || null,
        prc_license_number: (user as any).prc_license_number || null
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};
