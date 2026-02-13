# PowerShell script to set up the database
# Run this with: .\setup-database.ps1

Write-Host "Setting up Real Estate Database..." -ForegroundColor Cyan

# Prompt for PostgreSQL password
$password = Read-Host "Enter your PostgreSQL password for user 'postgres'" -AsSecureString
$PGPASSWORD = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($password))

# Set environment variable
$env:PGPASSWORD = $PGPASSWORD

Write-Host "`nStep 1: Creating database..." -ForegroundColor Yellow
$createDbCommand = "CREATE DATABASE real_estate_db;"
echo $createDbCommand | psql -U postgres -h localhost 2>&1 | Out-Null

if ($LASTEXITCODE -eq 0 -or $createDbCommand -match "already exists") {
    Write-Host "✓ Database created (or already exists)" -ForegroundColor Green
} else {
    Write-Host "Note: Database might already exist, continuing..." -ForegroundColor Yellow
}

Write-Host "`nStep 2: Running schema..." -ForegroundColor Yellow
psql -U postgres -h localhost -d real_estate_db -f database\schema.sql

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✓ Schema created successfully!" -ForegroundColor Green
} else {
    Write-Host "`n✗ Error creating schema. Check the output above." -ForegroundColor Red
    exit 1
}

# Clear password from memory
$env:PGPASSWORD = $null
Remove-Variable PGPASSWORD

Write-Host "`nDatabase setup complete!" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "1. Update your .env file with the correct DATABASE_URL"
Write-Host "2. Run 'npm run dev' to start the backend server"
