#!/bin/bash

set -euo pipefail
set -x

# Setup pnpm
npm install -g pnpm
pnpm setup
source ~/.bashrc

# Backend setup
cd backend || { echo "Failed to change directory to backend"; exit 1; }

# Install dependencies using pnpm
pnpm install
pnpm add typescript --save-dev
pnpm add @types/express @types/node --save-dev
pnpm add prisma @prisma/client

# Generate Prisma client and compile TypeScript
pnpm exec prisma generate
pnpm exec tsc

# Database updates
pnpm exec prisma db push --accept-data-loss
cd ..

# Frontend setup
cd frontend || { echo "Failed to change directory to frontend"; exit 1; }
pnpm install
pnpm add @vitejs/plugin-react --save-dev
pnpm run build
cd ..
