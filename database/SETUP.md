# Database Setup Guide

## Step 1: Create the Database

You can create the database in two ways:

### Option A: Using psql command line
```bash
psql -U postgres
```

Then run:
```sql
CREATE DATABASE real_estate_db;
\q
```

### Option B: Using pgAdmin
1. Open pgAdmin
2. Right-click on "Databases"
3. Select "Create" > "Database"
4. Name it: `real_estate_db`
5. Click "Save"

## Step 2: Run the Schema

After creating the database, run the schema file:

```bash
psql -U postgres -d real_estate_db -f database/schema.sql
```

Or in pgAdmin:
1. Connect to `real_estate_db`
2. Open Query Tool
3. Open file: `database/schema.sql`
4. Execute (F5)

## Step 3: Update .env File

Edit your `.env` file and update the DATABASE_URL:

```
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/real_estate_db
```

Replace `your_password` with your PostgreSQL password.

## Step 4: Test Connection

The backend will automatically connect when you start the server:
```bash
npm run dev
```

You should see: `✅ Connected to PostgreSQL database`

## Troubleshooting

### Connection Error
- Check if PostgreSQL is running
- Verify username and password in DATABASE_URL
- Ensure database exists: `psql -U postgres -l`

### Schema Error
- Make sure UUID extension is available
- Check PostgreSQL version (should be 12+)
