#!/bin/bash

set -euo pipefail
set -x

# Backend setup
cd backend || { echo "Failed to change directory to backend"; exit 1; }

# Clean install
rm -rf node_modules package-lock.json
rm -rf prisma/client

# Install core dependencies first
npm install
npm install typescript @types/express @types/node --save-dev

# Install and setup Prisma specifically
npm install prisma --save-dev
npm install @prisma/client

# Generate Prisma client with explicit path
export PRISMA_SCHEMA_PATH="./prisma/schema.prisma"
npx prisma generate --schema=./prisma/schema.prisma

# Compile TypeScript
npx tsc

# Database updates
npx prisma db push --accept-data-loss
cd ..

# Frontend setup
cd frontend || { echo "Failed to change directory to frontend"; exit 1; }
npm install
npm install @vitejs/plugin-react --save-dev
npm run build
cd ..
