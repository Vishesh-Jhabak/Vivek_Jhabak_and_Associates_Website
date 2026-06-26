# Chartered Accountant Website (Vivek Jhabak & Associates)

Production-ready, highly secure full-stack web application built with **React.js (Vite, Tailwind v4, Framer Motion)** for the Chartered Accountant firm **Vivek Jhabak & Associates**, powered by a **Node.js/Express** backend proxying to **Supabase** (PostgreSQL database, Auth, and Storage).

---

## Tech Stack & Core Libraries

- **Frontend**:
  - React.js (Vite SPA)
  - Tailwind CSS v4 (configured via `@tailwindcss/postcss` and theme files)
  - Framer Motion (premium UI animations)
  - React Router DOM (client-side page routing)
- **Backend**:
  - Node.js & Express.js
  - Supabase JS SDK (PostgreSQL queries, Storage buckets, and Authentication)
  - Multer (RAM memory buffer uploading)
  - Nodemailer (SMTP and simulated local fallbacks)
- **Security**:
  - `helmet`: Express security HTTP headers
  - `cors`: Cross-Origin Resource Sharing
  - `express-rate-limit`: Request throttling on brute-force logins and form spams
  - Custom XSS Sanitizer: Recursive sanitization of body, query, and params fields

---

## Supabase Database Setup (Crucial)

Before running the application, you must set up your tables in your Supabase project.

1. Navigate to your **Supabase Dashboard** -> **SQL Editor**.
2. Click **New query**, open the SQL schema file [schema.sql](file:///c:/Users/vishe/OneDrive/Desktop/Vivek_Jhabak_and_Associates/server/scripts/schema.sql) in your workspace, copy its contents, paste them into the SQL Editor, and click **Run**.
3. Create a **Private** Storage Bucket named `resumes` in your Supabase Dashboard under the **Storage** section.
4. Create an admin user under **Authentication** in your Supabase Dashboard:
   - **Email**: `admin@vivekjhabak.com` (or your email configured in `ADMIN_NOTIFY_EMAIL` environment variable)
   - **Password**: `AdminPassword123` (or custom password)

---

## Directory Structure

```
server/
├── scripts/
│   ├── schema.sql          -- SQL Table creations for Supabase
│   ├── seed.js             -- Seeds mock data into Supabase Postgres
│   └── test_endpoints.js   -- Express server integration checks
├── src/
│   ├── config/
│   │   ├── supabase.js     -- Connects and exports Supabase SDK client
│   │   └── nodemailer.js   -- Nodemailer transporter setup
│   ├── controllers/        -- Controllers implementing Supabase queries
│   ├── middleware/         -- Security filters and JWT auth validators
│   ├── routes/             -- Express endpoint mapping files
│   ├── app.js              -- Express app middleware bindings
│   └── server.js           -- App entrypoint listening on port
├── .env.example
├── .env
└── package.json

client/
├── src/
│   ├── pages/
│   │   ├── Home.jsx        -- Main website with search, schedules, & vacancies
│   │   ├── Login.jsx       -- Minimalist administrative login screen
│   │   └── Admin.jsx       -- Admin dashboard (tab views, approvals, CRUDs)
│   ├── utils/
│   │   └── api.js          -- Frontend fetch client pointing to Express APIs
│   ├── App.jsx             -- Router and Auth Context provider
│   └── index.css           -- Styles stylesheet linked to Tailwind
├── index.html
├── postcss.config.js
├── tailwind.config.js
└── package.json
```

---

## Setup & Run Instructions

### 1. Installation
Install project dependencies in both folders:
```bash
# Install Server packages
cd server
npm install

# Install Client packages (in separate terminal)
cd ../client
npm install
```

### 2. Environment Setup
Create a `.env` file in the `server` directory and paste your Supabase API credentials:
```env
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
ADMIN_NOTIFY_EMAIL=admin@vivekjhabak.com

# Get these from Supabase Settings -> API
SUPABASE_URL=https://your-project-ref.supabase.co
# Use your SECRET Service Role key (not the public anon key) on the backend
SUPABASE_SERVICE_ROLE_KEY=your_supabase_secret_service_role_key
SUPABASE_STORAGE_BUCKET=resumes
```

### 3. Database Seeding
To populate your Supabase tables with initial CA services, pricing levels, and job vacancies:
```bash
cd server
npm run seed
```

### 4. Running the Code
Start the Express server and Vite frontend:
```bash
# Terminal 1: Run Express Server (Port 5000)
cd server
npm run dev

# Terminal 2: Run React Vite App (Port 5173)
cd client
npm run dev
```

### 5. Running API Verification Tests
Verify all API endpoints (auth, appointments, services, pricing, messages, jobs, duplicate blocks, and route protections) work correctly:
```bash
cd server
npm run test:api
```
