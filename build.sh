#!/bin/bash

set -euo pipefail
set -x

cd backend

# Clean start
rm -rf node_modules package-lock.json yarn.lock
rm -rf prisma/client

# Install yarn
npm install -g yarn

# Install all dependencies including types
yarn install
yarn add typescript @types/express @types/node --dev
yarn add prisma --dev
yarn add @prisma/client
yarn add --dev @types/express @types/node ts-node

# Generate Prisma client
yarn prisma generate

# Run TypeScript compilation
yarn exec tsc

# Database updates
yarn prisma db push --accept-data-loss
cd ..

# Frontend setup
cd frontend
yarn install
yarn add @vitejs/plugin-react --dev
yarn build
cd ..
