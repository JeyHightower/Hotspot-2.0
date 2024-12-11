#!/bin/bash

set -euo pipefail
set -x

cd backend

# Clean start
rm -rf node_modules package-lock.json yarn.lock
rm -rf prisma/client

# Install yarn
npm install -g yarn

# Install dependencies using yarn
yarn install
yarn add typescript @types/express @types/node --dev
yarn add prisma --dev
yarn add @prisma/client

# Generate Prisma client
yarn prisma generate

# Build project using npx for TypeScript
npx tsc

# Database updates
yarn prisma db push --accept-data-loss
cd ..

# Frontend setup
cd frontend
yarn install
yarn add @vitejs/plugin-react --dev
yarn build
cd ..
