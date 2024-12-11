#!/bin/bash

set -euo pipefail
set -x

# Root level Prisma install
npm install prisma @prisma/client

# Backend setup
cd backend || { echo "Failed to change directory to backend"; exit 1; }

# Clean and fresh install
rm -rf node_modules package-lock.json
rm -rf prisma/client

# Install dependencies
npm install
npm install typescript @types/express @types/node --save-dev
npm install prisma @prisma/client

# Initialize Prisma and generate client
npx prisma init
npx prisma generate

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
