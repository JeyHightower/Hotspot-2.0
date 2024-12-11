#!/bin/bash

set -euo pipefail
set -x

# Backend setup
cd backend || { echo "Failed to change directory to backend"; exit 1; }

# Install dependencies with specific paths
npm init -y
npm install prisma --save-dev
npm install @prisma/client
npm install -g typescript
npm install @types/express @types/node typescript --save-dev

# Set Prisma environment
export PRISMA_SCHEMA_PATH="./prisma/schema.prisma"
export NODE_PATH="./node_modules"

# Generate Prisma client and compile TypeScript
npx prisma generate --schema="./prisma/schema.prisma"
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
