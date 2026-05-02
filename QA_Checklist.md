# NCHO System QA Checklist (Hardened Clinical Workflow)

Use this checklist to verify that all architectural pivot requirements are met and the system is stable.

## 1. Authentication & Role-Based Access

- [/] **Patient Login:** Log in as `p1@test.com` / `password123`. Verify access to Health Passport.
- [/] **Nurse Login:** Log in as `nurse@test.com` / `password123`. Verify "TRIAGE NURSE" badge is visible.
- [/] **Physician Login:** Log in as `doc@test.com` / `password123`. Verify "PHYSICIAN" badge is visible.
- [ ] **PRC Protection:** Attempt to perform a triage/consultation with an account that has NO PRC license (if applicable). Verify it returns a 403 error.

## 2. Patient Virtual Queue (End-to-End)

- [/] **Join Queue:** As a Patient, go to Health Passport -> "Join Clinic Queue".
- [/] **Department Selection:** Select "Outpatient (OPD)" or "Dental".
- [/] **Pre-Triage:** Fill in symptoms and pain level. Submit.
- [/] **Live Tracking:** Verify you receive a Queue Number (e.g., `OUT-001`) and the status is `PENDING_TRIAGE`.

## 3. Clinical Workflow (Provider Side)

- [/] **Live Dashboard:** As a Nurse, verify the patient appears in the "Live Clinical Queue" table.
- [/] **Triage Workspace:** Click "Start Triage". Enter BP (e.g., 120/80), Temp, and Weight. Save.
- [/] **Status Update:** Verify the patient's status in the queue changes to `WAITING_FOR_PROVIDER`.
- [/] **Physician Consult:** As a Physician, click "Consult Patient". Verify triage vitals are visible in the sidebar.
- [/] **Finalization:** Enter Diagnosis and Treatment Plan. Select "Complete Visit" or "Refer to Pharmacy". Save.
- [/] **Completion:** Verify the patient record is moved out of the active consultation queue or updated to `COMPLETED`.

## 4. Medical Vault & DPA Compliance

- [ ] **Medical Vault (Patient):** As a Patient, go to "Medical Records". Verify you can see the visit history but NO upload button.

* [ ] **Detailed Vitals:** Verify BP is displayed as `120/80 mmHg` (not the old single field).

- [ ] **Privacy Logs:** Verify that every provider access (Triage/Consult) is logged with the Provider's name and Timestamp.
- [ ] **Provider Upload:** As a Physician, use "Upload Lab Results" to add a file for a patient. Verify it is linked to your account.

## 5. System Stability

- [ ] **Live Polling:** Verify that the Provider Dashboard refreshes every 30 seconds (or manually refresh) to show new entries without crashing.
- [ ] **Search Logic:** Test the search bars in Patient Directory and Queue Table.
- [ ] **Empty States:** Ensure "No patients in queue" messages appear when the table is empty.
