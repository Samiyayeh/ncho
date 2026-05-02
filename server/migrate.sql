-- Migration Script: Add missing columns to PATIENTS table
-- Run this ONCE against an existing database to bring it in sync with the Sequelize models.
-- Safe to run multiple times (uses IF NOT EXISTS logic via ALTER TABLE).

USE ncho_patient_link;

-- Add account_status column (tracks whether a patient has been physically verified)
ALTER TABLE PATIENTS
    ADD COLUMN IF NOT EXISTS account_status ENUM('UNVERIFIED', 'ACTIVE') NOT NULL DEFAULT 'UNVERIFIED';

-- Add voter_registered column (LGU tracking requirement)
ALTER TABLE PATIENTS
    ADD COLUMN IF NOT EXISTS voter_registered BOOLEAN DEFAULT NULL;

-- Add household_head column (LGU tracking requirement)
ALTER TABLE PATIENTS
    ADD COLUMN IF NOT EXISTS household_head BOOLEAN DEFAULT NULL;

-- Add chronic_conditions column (baseline medical history)
ALTER TABLE PATIENTS
    ADD COLUMN IF NOT EXISTS chronic_conditions TEXT;
