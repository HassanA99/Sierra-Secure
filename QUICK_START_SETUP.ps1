# NDDV Quick Start Script for Windows PowerShell
# Usage: .\QUICK_START.ps1

$ErrorActionPreference = "Stop"

Write-Host "================================" -ForegroundColor Green
Write-Host "NDDV Environment Setup" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""

# Check for required tools
Write-Host "Checking prerequisites..." -ForegroundColor Yellow

# Check Node.js
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed. Please install Node.js 18 or later." -ForegroundColor Red
    exit 1
}

# Check npm
try {
    $npmVersion = npm --version
    Write-Host "✅ npm version: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm is not installed. Please install npm." -ForegroundColor Red
    exit 1
}

Write-Host ""

# Copy environment template
Write-Host "Setting up environment variables..." -ForegroundColor Yellow
if (-Not (Test-Path ".env.local")) {
    Copy-Item "env.template" ".env.local"
    Write-Host "✅ Created .env.local from template" -ForegroundColor Green
    Write-Host "⚠️  IMPORTANT: Edit .env.local with your actual configuration values!" -ForegroundColor Yellow
} else {
    Write-Host "✅ .env.local already exists" -ForegroundColor Green
}
Write-Host ""

# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Yellow
npm install
Write-Host "✅ Dependencies installed" -ForegroundColor Green
Write-Host ""

# Generate Prisma client
Write-Host "Generating Prisma client..." -ForegroundColor Yellow
npx prisma generate
Write-Host "✅ Prisma client generated" -ForegroundColor Green
Write-Host ""

# Run migrations
Write-Host "Running database migrations..." -ForegroundColor Yellow
Write-Host "Make sure PostgreSQL is running and DATABASE_URL is correctly configured in .env.local" -ForegroundColor Yellow
npx prisma migrate deploy
Write-Host "✅ Database migrated" -ForegroundColor Green
Write-Host ""

# Seed database (optional)
if (Test-Path "prisma/seed.ts") {
    Write-Host "Seeding database..." -ForegroundColor Yellow
    npm run seed
    Write-Host "✅ Database seeded" -ForegroundColor Green
    Write-Host ""
}

Write-Host "================================" -ForegroundColor Green
Write-Host "✅ Setup Complete!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""

Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Edit .env.local with your configuration:" -ForegroundColor Cyan
Write-Host "   - NEXT_PUBLIC_PRIVY_APP_ID (from Privy dashboard)" -ForegroundColor Cyan
Write-Host "   - PRIVY_APP_SECRET (from Privy dashboard)" -ForegroundColor Cyan
Write-Host "   - GOOGLE_API_KEY (from Google Cloud console)" -ForegroundColor Cyan
Write-Host "   - DATABASE_URL (PostgreSQL connection string)" -ForegroundColor Cyan
Write-Host "   - JWT_SECRET (generate a random 32+ character string)" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Start the development server:" -ForegroundColor Cyan
Write-Host "   npm run dev" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. Open http://localhost:3000 in your browser" -ForegroundColor Cyan
Write-Host ""
Write-Host "Documentation: See README.md and docs/ folder" -ForegroundColor Cyan
