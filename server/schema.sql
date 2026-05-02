-- Initial Database Schema for NCHO Patient-Link
-- Run this script to create the database and tables

CREATE DATABASE IF NOT EXISTS ncho_patient_link;
USE ncho_patient_link;

-- 1. PATIENTS Table
CREATE TABLE IF NOT EXISTS PATIENTS (
    patient_id VARCHAR(50) PRIMARY KEY, -- e.g., NCH-2026-001234
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    date_of_birth DATE,
    gender ENUM('Male', 'Female', 'Other'),
    blood_type VARCHAR(5),
    allergies TEXT,
    contact_number VARCHAR(20),
    address TEXT,
    account_status ENUM('UNVERIFIED', 'ACTIVE') NOT NULL DEFAULT 'UNVERIFIED',
    voter_registered BOOLEAN DEFAULT NULL,
    household_head BOOLEAN DEFAULT NULL,
    chronic_conditions TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. PROVIDERS Table
CREATE TABLE IF NOT EXISTS PROVIDERS (
    provider_id VARCHAR(50) PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    specialty VARCHAR(100),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    contact_number VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 3. ENCOUNTERS Table
CREATE TABLE IF NOT EXISTS ENCOUNTERS (
    encounter_id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id VARCHAR(50) NOT NULL,
    provider_id VARCHAR(50) NOT NULL,
    encounter_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    blood_pressure VARCHAR(20),
    heart_rate INT,
    temperature DECIMAL(5,2),
    weight DECIMAL(5,2),
    chief_complaint TEXT,
    diagnosis TEXT,
    treatment_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES PATIENTS(patient_id) ON DELETE CASCADE,
    FOREIGN KEY (provider_id) REFERENCES PROVIDERS(provider_id) ON DELETE CASCADE
);

-- 4. MEDICAL_RECORDS Table (with soft_delete)
CREATE TABLE IF NOT EXISTS MEDICAL_RECORDS (
    record_id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id VARCHAR(50) NOT NULL,
    provider_id VARCHAR(50) NOT NULL,
    encounter_id INT, -- Optional link to a specific encounter
    document_type VARCHAR(100) NOT NULL, -- e.g., 'Lab Result', 'Imaging', 'General'
    file_url VARCHAR(500) NOT NULL, -- Path to file stored via Multer
    description TEXT,
    soft_delete BOOLEAN DEFAULT FALSE, -- MUST BE INCLUDED AS PER REQUIREMENTS
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES PATIENTS(patient_id) ON DELETE CASCADE,
    FOREIGN KEY (provider_id) REFERENCES PROVIDERS(provider_id) ON DELETE CASCADE,
    FOREIGN KEY (encounter_id) REFERENCES ENCOUNTERS(encounter_id) ON DELETE SET NULL
);

-- 5. PRESCRIPTIONS Table
CREATE TABLE IF NOT EXISTS PRESCRIPTIONS (
    prescription_id INT AUTO_INCREMENT PRIMARY KEY,
    encounter_id INT NOT NULL,
    medication_name VARCHAR(255) NOT NULL,
    dosage VARCHAR(100) NOT NULL,
    frequency ENUM('OD', 'BID', 'TID', 'QID') NOT NULL,
    duration_days INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (encounter_id) REFERENCES ENCOUNTERS(encounter_id) ON DELETE CASCADE
);

-- 6. QR_ACCESS_TOKENS Table
CREATE TABLE IF NOT EXISTS QR_ACCESS_TOKENS (
    token_id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id VARCHAR(50) NOT NULL,
    token_string VARCHAR(255) UNIQUE NOT NULL,
    expires_at DATETIME NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES PATIENTS(patient_id) ON DELETE CASCADE
);

-- 7. AUDIT_LOGS Table (For Data Privacy Act Compliance)
CREATE TABLE IF NOT EXISTS AUDIT_LOGS (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    provider_id VARCHAR(50), -- Nullable if action was taken by patient
    patient_id VARCHAR(50), -- Nullable if action was purely administrative
    action_taken VARCHAR(255) NOT NULL,
    endpoint_accessed VARCHAR(255),
    ip_address VARCHAR(45),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (provider_id) REFERENCES PROVIDERS(provider_id) ON DELETE SET NULL,
    FOREIGN KEY (patient_id) REFERENCES PATIENTS(patient_id) ON DELETE SET NULL
);
