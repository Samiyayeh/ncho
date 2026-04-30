# NCHO Patient-Link

NCHO Patient-Link is a comprehensive healthcare web application consisting of a React frontend and a Node.js/Express backend with a MySQL database.

## Prerequisites

Before you begin, ensure you have the following installed on your system:
- **Node.js** (v18 or higher recommended)
- **MySQL** (v8 or higher recommended)

## 1. Database Setup

1. Open your MySQL client or terminal.
2. Run the provided schema script to create the database and tables. You can do this by executing `server/schema.sql`:
   ```bash
   mysql -u root -p < server/schema.sql
   ```
   *Note: Replace `root` with your MySQL username. You will be prompted for your password.*

## 2. Backend Setup

The backend is built with Node.js, Express, and Sequelize ORM.

1. Navigate to the `server` directory:
   ```bash
   cd server
   ```
2. Install the backend dependencies:
   ```bash
   npm install
   ```
3. Configure your environment variables:
   - Create or verify the `.env` file in the `server` directory. It should look like this:
     ```env
     DB_HOST=localhost
     DB_USER=root
     DB_PASSWORD=your_mysql_password
     DB_NAME=ncho_patient_link
     PORT=5000
     ```
   - **Important:** Update `DB_USER` and `DB_PASSWORD` to match your local MySQL credentials.
4. Start the backend development server:
   ```bash
   npm run dev
   ```
   The backend will run on `http://localhost:5000`.

## 3. Frontend Setup

The frontend is built with React and Vite.

1. Open a new terminal and navigate to the **root directory** of the project (`ncho/`).
2. Install the frontend dependencies:
   ```bash
   npm install
   ```
3. Configure your environment variables:
   - Verify there is a `.env` file in the root directory with the following content:
     ```env
     VITE_API_BASE_URL=/api
     ```
4. Start the frontend development server:
   ```bash
   npm run dev
   ```
   The frontend will automatically proxy API requests (like `/api` and `/uploads`) to the backend server running on port 5000.
   Open your browser and navigate to the URL provided by Vite (usually `http://localhost:5173`).