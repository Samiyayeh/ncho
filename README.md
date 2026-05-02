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

### 2. Backend Setup
1.  **Navigate to server:** `cd server`
2.  **Install dependencies:** `npm install`
3.  **Configure `.env`:**
    Create a `.env` file in the `server` directory:
    ```env
    DB_HOST=localhost
    DB_USER=root
    DB_PASSWORD=your_password
    DB_NAME=ncho_patient_link
    PORT=5000
    ```
4.  **Configure `.env.test`:**
    Create a `.env.test` file (for safe testing):
    ```env
    DB_HOST=localhost
    DB_USER=root
    DB_PASSWORD=your_password
    DB_NAME=ncho_test
    PORT=5001
    ```

### 3. Seeding the Database
To populate the system with test patients and clinical providers:
*   **Development Seed:** `npm run seed` (Wipes `ncho_patient_link`)
*   **Test Seed:** `npm run seed:test` (Wipes `ncho_test`)

### 4. Frontend Setup
1.  **Navigate to root:** `cd ..`
2.  **Install dependencies:** `npm install`
3.  **Start Frontend:** `npm run dev`

---

## 🧪 Testing the System (Manual Workflow)

Since automated tests have been removed, follow this manual guide to verify the clinical workflow.

### 1. Reset the Test Environment
Always start with a clean database to ensure John Doe is in the queue:
```bash
# In the /server terminal
npm run seed:test
```

### 2. Run the Servers in Test Mode
Ensure you are using the test database and port:
*   **Backend**: `npm run dev:test` (runs on port 5001)
*   **Frontend**: `npm run dev`

### 3. Clinical Workflow Guide
Follow these steps to test the full patient journey:

| Step | Role | Login Email | Action |
| :--- | :--- | :--- | :--- |
| **1. Triage** | Nurse | `bob.ross@ncho.gov` | Find **John Doe**, click **Start Triage**, enter vitals. |
| **2. Consult** | Physician | `alice.walker@ncho.gov` | Find **John Doe**, click **Consult**, enter diagnosis/Rx, select **Refer to Pharmacy**. |
| **3. Dispense** | Pharmacist | `charlie.brown@ncho.gov` | Find **John Doe**, click **Consult**, verify meds, click **Confirm Dispensing**. |

**Passwords for all accounts**: `password123`

---

## 👥 Seeded Test Accounts

| Name | Role | Email |
| :--- | :--- | :--- |
| **John Doe** | Patient | `john.doe@example.com` |
| **Jane Smith** | Patient | `jane.smith@example.com` |
| **Alice Walker** | Physician | `alice.walker@ncho.gov` |
| **Bob Ross** | Triage Nurse | `bob.ross@ncho.gov` |
| **Charlie Brown**| Pharmacist | `charlie.brown@ncho.gov` |
| **Diana Prince** | Dentist | `diana.prince@ncho.gov` |
| **Ethan Hunt** | Social Worker| `ethan.hunt@ncho.gov` |

*All passwords are set to: `password123`*

---

## 🛠️ Development Scripts

### Root Directory
*   `npm run dev`: Starts the Vite frontend.
*   `npm run build`: Builds the frontend for production.

### Server Directory
*   `npm run dev`: Starts backend with `nodemon`.
*   `npm run dev:test`: Starts backend using the test database.
*   `npm run seed`: Resets and seeds the dev database.
*   `npm run seed:test`: Resets and seeds the test database.