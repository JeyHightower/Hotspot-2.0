#!/bin/bash

set -euo pipefail
set -x

# Backend setup
cd backend || { echo "Failed to change directory to backend"; exit 1; }

# Install pnpm
npm install -g pnpm

# Install dependencies using pnpm
pnpm install
pnpm add -g typescript
pnpm add @types/express @types/node typescript --save-dev
pnpm add prisma @prisma/client

# Generate Prisma client and compile TypeScript
pnpm dlx prisma generate
npx tsc

# Database updates
pnpm dlx prisma db push --accept-data-loss
cd ..

# Frontend setup
cd frontend || { echo "Failed to change directory to frontend"; exit 1; }
pnpm install
pnpm add @vitejs/plugin-react --save-dev
pnpm run build
cd ..
