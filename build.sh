#!/bin/bash

# Enable error tracking
set -euo pipefail
set -x

# Root level setup with logging
echo "Starting build process..."
npm install prisma @prisma/client
echo "Root level dependencies installed"

# Backend setup with detailed logging
cd backend || { echo "Failed to change directory to backend"; exit 1; }
echo "Entered backend directory"

# Clean installation
rm -rf node_modules package-lock.json prisma/client
echo "Cleaned previous installations"

# Install with verbose logging
npm install --verbose
npm install typescript @types/express @types/node --save-dev --verbose
npm install prisma @prisma/client --verbose

echo "All dependencies installed"

# Prisma operations with logging
echo "Generating Prisma client..."
npx prisma generate --verbose

echo "Compiling TypeScript..."
npx tsc --verbose

echo "Updating database..."
npx prisma db push --accept-data-loss
cd ..

# Frontend setup
cd frontend
echo "Building frontend..."
npm install
npm install @vitejs/plugin-react --save-dev
npm run build
cd ..

echo "Build process completed"
