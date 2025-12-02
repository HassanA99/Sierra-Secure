#!/usr/bin/env bash
# NDDV Setup Script - Initialize development environment
# Usage: bash SETUP.sh

set -e

echo "================================"
echo "NDDV Environment Setup"
echo "================================"
echo ""

# Check for required tools
echo "Checking prerequisites..."

if ! command -v node &> /dev/null; then
  echo "❌ Node.js is not installed. Please install Node.js 18 or later."
  exit 1
fi

if ! command -v npm &> /dev/null; then
  echo "❌ npm is not installed. Please install npm."
  exit 1
fi

if ! command -v psql &> /dev/null; then
  echo "⚠️  PostgreSQL CLI (psql) not found. Make sure PostgreSQL is running."
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"
echo ""

# Copy environment template
echo "Setting up environment variables..."
if [ ! -f .env.local ]; then
  cp env.template .env.local
  echo "✅ Created .env.local from template"
  echo "⚠️  IMPORTANT: Edit .env.local with your actual configuration values!"
else
  echo "✅ .env.local already exists"
fi
echo ""

# Install dependencies
echo "Installing dependencies..."
npm install
echo "✅ Dependencies installed"
echo ""

# Create database if not exists
echo "Setting up database..."
echo "Make sure PostgreSQL is running and DATABASE_URL is correctly configured in .env.local"
echo ""

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate
echo "✅ Prisma client generated"
echo ""

# Run migrations
echo "Running database migrations..."
npx prisma migrate deploy
echo "✅ Database migrated"
echo ""

# Seed database (optional)
if [ -f "prisma/seed.ts" ]; then
  echo "Seeding database..."
  npm run seed
  echo "✅ Database seeded"
  echo ""
fi

echo "================================"
echo "✅ Setup Complete!"
echo "================================"
echo ""
echo "Next steps:"
echo "1. Edit .env.local with your configuration:"
echo "   - NEXT_PUBLIC_PRIVY_APP_ID (from Privy dashboard)"
echo "   - PRIVY_APP_SECRET (from Privy dashboard)"
echo "   - GOOGLE_API_KEY (from Google Cloud console)"
echo "   - DATABASE_URL (PostgreSQL connection string)"
echo "   - JWT_SECRET (generate a random 32+ character string)"
echo ""
echo "2. Start the development server:"
echo "   npm run dev"
echo ""
echo "3. Open http://localhost:3000 in your browser"
echo ""
echo "Documentation: See README.md and docs/ folder"
