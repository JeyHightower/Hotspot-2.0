#!/bin/bash

set -euo pipefail
set -x

# Backend setup
cd backend || { echo "Failed to change directory to backend"; exit 1; }

# Install all dependencies first
npm install
npm install -g typescript
npm install @types/express @types/node typescript @prisma/client prisma --save-dev

# Generate Prisma client
npx prisma generate

# Now compile TypeScript
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
