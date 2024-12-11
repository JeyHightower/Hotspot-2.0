#!/bin/bash

set -euo pipefail
set -x

# Backend setup
cd backend || { echo "Failed to change directory to backend"; exit 1; }

# Install dependencies using npm
npm install
npm install typescript @types/express @types/node --save-dev
npm install prisma @prisma/client

# Generate Prisma client and compile TypeScript
npx prisma generate
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
