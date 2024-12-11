#!/bin/bash

set -euo pipefail
set -x

# Backend setup
cd backend || { echo "Failed to change directory to backend"; exit 1; }

# Clear node_modules and package-lock.json for clean install
rm -rf node_modules package-lock.json

# Install dependencies in correct order
npm install
npm install -g typescript
npm install @types/express @types/node typescript --save-dev
npm install @prisma/client prisma

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
