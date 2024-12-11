#!/bin/bash

set -euo pipefail
set -x

cd backend

# Clean start
rm -rf node_modules package-lock.json yarn.lock
rm -rf prisma/client

# Install yarn
npm install -g yarn

# Install dependencies with all necessary types
yarn install
yarn add typescript@5.7.2 @types/express@5.0.0 @types/node@22.10.1 --dev
yarn add prisma@5.7.0 --dev
yarn add @prisma/client@5.7.0
yarn add --dev ts-node@10.9.2
yarn add --dev @types/express-serve-static-core

# Generate Prisma client
NODE_ENV=development npx prisma generate

# Run TypeScript compilation
yarn exec tsc

# Database updates
npx prisma db push --accept-data-loss
cd ..

# Frontend setup
cd frontend
yarn install
yarn add @vitejs/plugin-react --dev
yarn build
cd ..
