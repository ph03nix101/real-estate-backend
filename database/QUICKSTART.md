# Quick Database Setup

## Option 1: Automated Setup (Recommended)

Run the setup script which will create the database and run the schema:

```powershell
.\setup-database.ps1
```

You'll be prompted for your PostgreSQL password. After that, everything will be set up automatically.

## Option 2: Manual Setup

If the script doesn't work, follow these steps:

### Step 1: Create Database

Open PowerShell and run:
```powershell
psql -U postgres
```

Then in the PostgreSQL prompt:
```sql
CREATE DATABASE real_estate_db;
\c real_estate_db
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
\q
```

### Step 2: Run Schema

```powershell
cd database
psql -U postgres -d real_estate_db -f schema.sql
```

### Step 3: Update .env

Edit your `.env` file and update the DATABASE_URL:

```
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/real_estate_db
```

Replace `YOUR_PASSWORD` with your actual PostgreSQL password.

### Step 4: Test Connection

Restart the backend server:
```powershell
npm run dev
```

You should see: `✅ Connected to PostgreSQL database`

## Verify Tables Were Created

```powershell
psql -U postgres -d real_estate_db -c "\dt"
```

You should see tables: `users`, `properties`, `inquiries`
