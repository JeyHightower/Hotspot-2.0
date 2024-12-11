#!/bin/bash

set -euo pipefail
set -x

# Install Prisma globally first
npm install -g prisma

# Backend setup
cd backend || { echo "Failed to change directory to backend"; exit 1; }

# Fresh install of dependencies
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
npm install -g typescript
npm install @types/express @types/node typescript --save-dev
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
