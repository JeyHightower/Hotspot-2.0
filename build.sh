#!/bin/bash

set -euo pipefail
set -x

# Root level setup
echo "Starting build process..."
npm install prisma @prisma/client

# Backend setup
cd backend || { echo "Failed to change directory to backend"; exit 1; }
echo "Entered backend directory"

# Clean installation
rm -rf node_modules package-lock.json prisma/client
echo "Cleaned previous installations"

# Install dependencies
npm install
npm install typescript @types/express @types/node --save-dev
npm install prisma @prisma/client

echo "All dependencies installed"

# Prisma operations
echo "Generating Prisma client..."
npx prisma generate

echo "Compiling TypeScript..."
npx tsc

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
