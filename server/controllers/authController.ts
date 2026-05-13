import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Account } from '../models/Account';
import { Patient } from '../models/Patient';
import { Provider } from '../models/Provider';
import { AuditLog } from '../models/AuditLog';
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_change_me';

export const registerPatient = async (req: Request, res: Response) => {
  try {
    const { 
      first_name, last_name, email, password, date_of_birth, gender, contact_number, address,
      voter_registered, household_head, blood_type, allergies, chronic_conditions
    } = req.body;

    // Check for duplicate email in the unified accounts table
    const existingAccount = await Account.findOne({ where: { email } });
    if (existingAccount) {
      return res.status(400).json({ error: 'Email already registered.' });
    }

    const password_hash = await bcrypt.hash(password, 10);

    // 1. Create the Account row first
    const account = await Account.create({
      email,
      password_hash,
      role: 'patient'
    });

    // 2. Create the Patient row linked to the account
    const patient_id = `NCH-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    const patient = await Patient.create({
      patient_id, account_id: account.account_id,
      first_name, last_name, date_of_birth, gender, contact_number, address,
      voter_registered: voter_registered === 'yes' || voter_registered === true,
      household_head: household_head === 'yes' || household_head === true,
      blood_type,
      allergies: Array.isArray(allergies) ? allergies.join(', ') : allergies,
      chronic_conditions
    });

    // Generate token for auto-login (payload shape unchanged)
    const token = jwt.sign({ id: patient_id, role: 'patient', role_type: null }, JWT_SECRET, { expiresIn: '8h' });

    // Log registration event
    await AuditLog.create({
      patient_id: patient_id,
      action_taken: 'New Patient Account Registered',
      endpoint_accessed: '/api/auth/register/patient',
      ip_address: req.ip || req.socket.remoteAddress || 'Unknown'
    });

    res.status(201).json({ 
      message: 'Patient registered successfully', 
      token,
      user: {
        id: patient_id,
        first_name: patient.first_name,
        last_name: patient.last_name,
        role: 'patient',
        role_type: null
      }
    });
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

    if (role !== 'patient' && role !== 'provider') {
      return res.status(400).json({ error: 'Invalid role specified.' });
    }

    // Single lookup against the unified accounts table
    const account = await Account.findOne({ where: { email } });

    if (!account) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    // Ensure the account role matches what the user selected on the login form
    if (account.role !== role) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    console.log(`Login attempt for ${email}. Password hash exists: ${!!account.password_hash}`);

    const isMatch = await bcrypt.compare(password, account.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    // Fetch the linked domain record to get user-specific fields
    let user: any;
    let userId: string;
    let roleType: string | null = null;

    if (role === 'patient') {
      user = await Patient.findOne({ where: { account_id: account.account_id } });
      if (!user) return res.status(401).json({ error: 'Invalid credentials.' });
      userId = user.patient_id;
    } else {
      user = await Provider.findOne({ where: { account_id: account.account_id } });
      if (!user) return res.status(401).json({ error: 'Invalid credentials.' });
      userId = user.provider_id;
      roleType = user.role_type || null;
    }

    const token = jwt.sign({ id: userId, role, role_type: roleType }, JWT_SECRET, { expiresIn: '8h' });

    // Log login event
    await AuditLog.create({
      provider_id: role === 'provider' ? userId : null,
      patient_id: role === 'patient' ? userId : null,
      action_taken: `User Login (${role.toUpperCase()})`,
      endpoint_accessed: '/api/auth/login',
      ip_address: req.ip || req.socket.remoteAddress || 'Unknown'
    });

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: userId,
        first_name: user.first_name,
        last_name: user.last_name,
        role,
        role_type: roleType,
        prc_license_number: (user as any).prc_license_number || null
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

