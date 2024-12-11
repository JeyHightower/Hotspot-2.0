#!/bin/bash

set -euo pipefail
set -x

cd backend

# Clean start
rm -rf node_modules package-lock.json yarn.lock
rm -rf prisma/client

# Install yarn
npm install -g yarn

# Install dependencies with specific versions
yarn install
yarn add typescript@5.7.2 @types/express@5.0.0 @types/node@22.10.1 --dev
yarn add prisma@5.7.0 --dev
yarn add @prisma/client@5.7.0
yarn add --dev ts-node@10.9.2

# Generate Prisma client with specific version
NODE_ENV=development npx prisma@5.7.0 generate

# Run TypeScript compilation
yarn exec tsc

# Database updates
npx prisma@5.7.0 db push --accept-data-loss
cd ..

# Frontend setup
cd frontend
yarn install
yarn add @vitejs/plugin-react --dev
yarn build
cd ..
