# NCHO Patient-Link

NCHO Patient-Link is a professional healthcare ecosystem designed to streamline patient registration, clinical encounters, and pharmaceutical fulfillment. The system consists of a React-based frontend and a Node.js/Express backend powered by MySQL.

---

## 🚀 Quick Start Guide

### 1. Database Setup
Ensure you have **MySQL** installed and running.

1.  **Create Databases:**
    ```sql
    CREATE DATABASE ncho_patient_link;
    CREATE DATABASE ncho_test; -- For safe testing
    ```
2.  **Initialize Schema:**
    Navigate to the `server` folder and run the schema against your main database:
    ```bash
    mysql -u root -p ncho_patient_link < schema.sql
    ```

### 2. Environment Setup

The system requires environment variables for both the backend and frontend.

#### Backend (.env)
Create a `.env` file in the `server` directory:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=ncho_patient_link
PORT=5000
```

#### Frontend (.env)
Create a `.env` file in the **root** directory:
```env
# Use your local IP (e.g., 192.168.x.x) to allow mobile devices to connect
VITE_API_BASE_URL=http://localhost:5000/api
```

### 3. Hosting Locally (CMD)

To run the full system, you need to start both the backend and the frontend in separate terminal windows.

#### Terminal 1: Backend
```cmd
cd server
npm install
npm run seed  # Optional: Seed the database
npm run dev
```

#### Terminal 2: Frontend
```cmd
npm install
npm run dev -- --host
```

The system will be accessible at:
- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000/api](http://localhost:5000/api)
- **Database Seeding**: See below for options.

### 4. Seeding the Database

To populate the system with test data, run these commands from the `server` directory:

*   **Basic Seed**: `npm run seed` (Resets DB, creates base accounts)
*   **Dashboard Seed**: `npm run seed:dashboard` (Generates 100+ realistic encounters)
*   **Test Environment Seed**: `npm run seed:test` (Wipes the test database)

---

## 🧪 Testing the System (Manual Workflow)

Since automated tests have been removed, follow this manual guide to verify the clinical workflow.

### 1. Reset the Test Environment
Always start with a clean database for a fresh test state:
```bash
# In the /server terminal
npm run seed:test
```

### 2. Run the Servers in Test Mode
Ensure you are using the test database and port:
*   **Backend**: `npm run dev:test` (runs on port 5001)
*   **Frontend**: `npm run dev:test` (points to port 5001)

### 3. Clinical Workflow Guide (Scan-to-Start)
Follow these steps to test the streamlined clinical journey:

| Step | Role | Login Email | Action |
| :--- | :--- | :--- | :--- |
| **1. Identity** | Patient | `john.doe@example.com` | View **Health Passport** to display your unique QR code. |
| **2. Access** | Provider | `alice.walker@ncho.gov` | Use **Patient Directory**, scan QR or enter ID, then click **Start New Encounter**. |
| **3. Consult** | Provider | `alice.walker@ncho.gov` | Enter vitals, diagnosis, and prescriptions in the **Encounter Workspace**. |
| **4. Fulfillment**| Pharmacist | `charlie.brown@ncho.gov` | Find patient, review prescribed meds, and click **Confirm Dispensing**. |

**Passwords for all accounts**: `password123`

---

## 👥 Seeded Test Accounts

| Name | Role | Email |
| :--- | :--- | :--- |
| **John Doe** | Patient | `john.doe@example.com` |
| **Jane Smith** | Patient | `jane.smith@example.com` |
| **Alice Walker** | Physician | `alice.walker@ncho.gov` |
| **Bob Ross** | Clinical Staff | `bob.ross@ncho.gov` |
| **Charlie Brown**| Pharmacist | `charlie.brown@ncho.gov` |
| **Diana Prince** | Dentist | `diana.prince@ncho.gov` |
| **Ethan Hunt** | Social Worker| `ethan.hunt@ncho.gov` |

*All passwords are set to: `password123`*

---

## 🛠️ Development Scripts

### Root Directory
*   `npm run dev`: Starts the Vite frontend pointing to main server (Port 5000).
*   `npm run dev:test`: Starts the Vite frontend pointing to test server (Port 5001).
*   `npm run build`: Builds the frontend for production.

### Server Directory
*   `npm run dev`: Starts backend with `nodemon`.
*   `npm run dev:test`: Starts backend using the test database.
*   `npm run seed`: Resets and seeds the dev database.
*   `npm run seed:test`: Resets and seeds the test database.
*   `npm run seed:dashboard`: Generates 100+ realistic encounters for visualization.
*   `npm run seed:dashboard:test`: Targets the test database with realistic visualization data.
*   `npm run seed:analytics`: Legacy: Generates 150+ patients/encounters.

---

## 🗄️ Entity Relationship Diagram

> The system uses **7 active database entities**. The `ENCOUNTERS` table is the core hub — both consultations and file uploads are recorded as encounters, ensuring all provider activity is uniformly tracked.

```mermaid
erDiagram
    PATIENTS {
        string patient_id PK
        string first_name
        string last_name
        string email UK
        string password_hash
        date date_of_birth
        enum gender
        string blood_type
        text allergies
        string contact_number
        text address
        boolean voter_registered
        boolean household_head
        text chronic_conditions
        enum verification_status
        datetime created_at
        datetime updated_at
    }

    PROVIDERS {
        string provider_id PK
        string first_name
        string last_name
        string specialty
        string email UK
        string password_hash
        string contact_number
        string prc_license_number
        enum role_type
        datetime created_at
        datetime updated_at
    }

    ENCOUNTERS {
        int encounter_id PK
        string patient_id FK
        string provider_id FK
        enum status
        enum encounter_type
        datetime encounter_date
        int bp_systolic
        int bp_diastolic
        int heart_rate
        decimal temperature
        decimal weight
        text chief_complaint
        text diagnosis
        text treatment_notes
        text treatment_plan
        json specialized_data
        datetime created_at
        datetime updated_at
    }

    PRESCRIPTIONS {
        int prescription_id PK
        int encounter_id FK
        string medication_name
        string dosage
        enum frequency
        int duration_days
        string prescriber_prc_number
        datetime created_at
    }

    MEDICAL_RECORDS {
        int record_id PK
        string patient_id FK
        string provider_id FK
        int encounter_id FK
        string document_type
        string file_url
        text description
        boolean soft_delete
        datetime created_at
        datetime updated_at
        datetime deleted_at
    }

    QR_ACCESS_TOKENS {
        int token_id PK
        string patient_id FK
        string token_string UK
        datetime expires_at
        boolean is_active
        datetime created_at
    }

    AUDIT_LOGS {
        int log_id PK
        string provider_id FK
        string patient_id FK
        string action_taken
        string endpoint_accessed
        string ip_address
        datetime timestamp
    }

    PATIENTS ||--o{ ENCOUNTERS : "has"
    PROVIDERS ||--o{ ENCOUNTERS : "conducts"
    ENCOUNTERS ||--o{ PRESCRIPTIONS : "generates"
    ENCOUNTERS ||--o{ MEDICAL_RECORDS : "contains"
    PATIENTS ||--o{ MEDICAL_RECORDS : "owns"
    PROVIDERS ||--o{ MEDICAL_RECORDS : "uploads"
    PATIENTS ||--o{ QR_ACCESS_TOKENS : "holds"
    PATIENTS ||--o{ AUDIT_LOGS : "subject of"
    PROVIDERS ||--o{ AUDIT_LOGS : "actor in"
```

---

## 🏗️ System Logical Architecture

### NCHO Full-Stack Logical Flowchart

The following diagram maps the end-to-end data flow between the React frontend, Express controllers, and the MySQL database, including the automated Data Privacy Act (DPA) logging triggers.

```mermaid
flowchart TD
    Start([User Opens App]) --> Landing[Landing Page]
    Landing --> AuthCheck{Auth Token Exists?}

    %% AUTHENTICATION LAYER
    AuthCheck -- No --> Login[Login Page]
    Login --> Submit[Submit Credentials]
    Submit --> B_Auth[Backend: authController]
    B_Auth --> B_Bcrypt{Verify Hash}
    B_Bcrypt -- Fail --> LoginErr[Display Auth Error]
    B_Bcrypt -- Success --> B_JWT[Generate JWT + Role]
    B_JWT --> StoreToken[Frontend: Store Token & User State]

    %% ROLE ROUTING
    StoreToken --> RoleCheck{User Role?}
    AuthCheck -- Yes --> RoleCheck

    %% PATIENT PORTAL LOGIC
    RoleCheck -- Patient --> PDash[Patient Passport]
    subgraph "Patient Journey (Frontend & Backend)"
        PDash --> P_QR[Frontend: Generate QR Code from ID]
        PDash --> P_FetchRecords[API: GET /patient/records]
        P_FetchRecords --> B_Rec[Backend: patientController]
        B_Rec --> DB_Rec[(DB: Records & Encounters)]
        DB_Rec -- JSON --> P_Render[Frontend: Render History & Vitals]
        
        P_Render --> P_Search[Frontend: Multi-field Search/Filter]
        P_Render --> P_Modal[Frontend: Selected Detail Modal]
        P_Modal -- Type: File --> P_DocView[Frontend: In-App Document Viewer]
        
        PDash --> P_Logs[API: GET /privacy-logs]
        P_Logs --> B_Logs[Backend: Filter Logs by PatientID]
        B_Logs --> L_Scrub[Logic: Scrub IP Addresses]
        L_Scrub --> P_LogsRender[Frontend: Render Transparent Audit Feed]
    end

    %% PROVIDER PORTAL LOGIC
    RoleCheck -- Provider --> DrDash[Provider Dashboard]
    subgraph "Provider Journey (Frontend & Backend)"
        DrDash --> Dr_Stats[API: GET /dashboard/stats]
        Dr_Stats --> B_Stats[Backend: clinicalController]
        B_Stats --> B_Dedup[Logic: Deduplicate Last 5 Unique Patients]
        B_Stats --> B_KPI[Logic: Aggregate Daily Performance]
        
        DrDash --> Dr_Lookup[Frontend: Patient Lookup]
        Dr_Lookup --> Dr_Hub[Patient Record View / Clinical Hub]
        
        subgraph "Encounter Workflow"
            Dr_Hub --> Enc_Start[API: POST /encounters/start]
            Enc_Start --> B_Draft[Backend: Create/Resume IN_PROGRESS]
            B_Draft --> Enc_Work[Encounter Workspace]
            
            Enc_Work --> Enc_Drafting[Frontend: Sync State to LocalStorage]
            Enc_Drafting --> Enc_Save[API: PATCH /update-draft]
            
            Enc_Work --> Enc_Final[API: POST /finalize]
            Enc_Final --> B_Transac[Backend: MySQL Transaction]
            subgraph "Backend Transaction"
                B_Transac --> B_EncSave[Save Encounter Data]
                B_Transac --> B_Meds[Map & Bulk-Save Prescriptions]
                B_Transac --> B_Status[Update Status: COMPLETED]
            end
            B_Transac --> B_Audit[Trigger: AuditLog.create]
        end
        
        Dr_Hub --> Dr_Upload[API: POST /upload-record]
        Dr_Upload --> B_Multer[Backend: Multer File Handling]
        B_Multer --> B_RecLink[Backend: Link Record to Shadow Encounter]
    end

    %% DPA COMPLIANCE (CROSS-SYSTEM)
    B_Audit --> DB_Logs[(DB: AUDIT_LOGS)]
    B_RecLink --> B_Audit
    B_Auth --> B_Audit

    %% EXIT
    DrDash --> Logout[Logout]
    PDash --> Logout
    Logout --> ClearCache[Clear Token & State]
    ClearCache --> Start

    %% STYLING
    style B_Transac fill:#e1f5fe,stroke:#01579b
    style B_Audit fill:#fff3e0,stroke:#e65100
    style RoleCheck fill:#f3e5f5,stroke:#4a148c
    style DB_Rec fill:#e8f5e9,stroke:#1b5e20
    style DB_Logs fill:#e8f5e9,stroke:#1b5e20
```

### 🛠️ Detailed Breakdown of Logical Sides

#### 1. Frontend Logic (React)
*   **Role-Based Routing**: Uses the JWT payload to protect routes, ensuring Patients cannot access Provider endpoints.
*   **Stateful Filtering**: The `ClinicalView` search bar uses a complex `filter()` chain that parses dates and matches keywords across five different data fields (Diagnosis, Complaint, Date, Provider, Medications).
*   **Dynamic UI Deduplication**: The Provider Dashboard ensures the "Recent Patients" list only displays the single most recent unique visit per patient ID, even if the backend returns raw encounter logs.

#### 2. Backend Logic (Express + Sequelize)
*   **Transaction Integrity**: The `saveClinical` controller uses a SQL Transaction. If any part of the encounter or prescription saving fails, the entire record is rolled back to maintain medical data integrity.
*   **Shadow Encounters**: Medical record uploads programmatically create a companion `FILE_UPLOAD` encounter. This ensures file activity is seamlessly integrated into the clinical timeline and caught by audit triggers.
*   **Middleware Guards**: Every API call (except login) passes through `authMiddleware` which verifies the JWT and attaches the actor's ID to the request for logging.

#### 3. Security & DPA Logic
*   **Automatic Audit Triggers**: Accessing patient records or finalizing consultations triggers an `AuditLog.create()` call before the final server response is sent.
*   **Technical Privacy**: The Privacy Logs controller specifically scrubs `ip_address` data from responses on the patient-facing portal to protect backend metadata while maintaining transparency.
