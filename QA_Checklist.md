# NCHO System QA Checklist (Unified Account System)

Use this checklist to verify that all architectural pivot requirements are met and the system is stable across the unified accounts transition.

## 0. Unified Account System (New Architecture)

- [ ] **Cross-Role Email Uniqueness:** Attempt to register a new Patient with an email already used by a Provider. Verify it returns a 400 error.
- [ ] **Global Login:** Verify that the single login endpoint handles both Patients and Providers correctly based on the `role` payload.
- [ ] **Account Linking:** After registration, verify the database `ACCOUNTS` table has 1 record and `PATIENTS` table has 1 record linked by `account_id`.
- [ ] **Credential Centralization:** Verify `PATIENTS` and `PROVIDERS` tables no longer contain `email` or `password_hash` columns.

## 1. Authentication & Role-Based Access

- [ ] **Patient Login:** Log in as `john.doe@example.com` / `password123`. Verify access to Health Passport.
- [ ] **Provider Login:** Log in as `alice.walker@ncho.gov` / `password123`. Verify "PHYSICIAN" badge is visible.
- [ ] **Session Integrity:** Log out and verify you cannot access `/dashboard` or `/passport` via direct URL.

## 2. Patient-Provider Link (Scan-to-Start)

- [ ] **QR Presentation:** As a Patient, go to Health Passport. Verify QR code is visible and contains a valid token.
- [ ] **Provider Scan:** As a Provider, navigate to Patient Directory -> Scan QR. Verify it redirects to the correct Patient Record.
- [ ] **Direct Lookup:** As a Provider, enter a Patient ID manually. Verify it redirects to the correct Patient Record.

## 3. Clinical Workflow (Provider Side)

- [ ] **Initiate Encounter:** From the Patient Record view, click "Start New Encounter". Verify the workspace loads.
- [ ] **Vitals Collection:** Enter BP (e.g., 120/80), Temp, and Weight. Verify auto-save "Draft Saved" indicator appears.
- [ ] **Clinical Notes:** Enter Diagnosis and Treatment Plan.
- [ ] **Finalization:** Enter Diagnosis and Treatment Plan. Save as "Complete Visit".

## 4. Security & Compliance

- [ ] **Privacy Logs:** Verify that the consultation access is logged in the "Security Feed" with the Provider's name and Timestamp.
- [ ] **Password Security:** (Patient) Go to Profile -> Change Password. Verify you can log in with the new password and the old one is rejected.
- [ ] **Directory Privacy:** Verify `GET /api/provider/directory` does NOT return `password_hash` or `account_id` in the JSON response.

## 5. Full System Integration (E2E Workflow)

1.  **Register:** Register a brand new patient (`new.test@example.com`).
2.  **Verify Profile:** Log in as the new patient, go to Profile, and verify the email matches.
3.  **Lookup:** Log in as a Provider and search for `new.test@example.com` in the Patient Directory.
4.  **Encounter:** Start and complete a full encounter for this new patient.
5.  **History:** Verify the encounter appears in the patient's "Medical Records" tab.
