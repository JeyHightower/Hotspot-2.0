#!/bin/bash

set -euo pipefail
set -x

cd backend

# Clean installation
rm -rf node_modules package-lock.json
npm cache clean --force

# Install dependencies in correct order
npm install --legacy-peer-deps
npm install -g prisma
npm install prisma --save-dev
npm install @prisma/client

# Generate Prisma client
prisma generate

# Build the project
npx tsc
prisma db push --accept-data-loss
cd ..

# Frontend setup
cd frontend
npm install --legacy-peer-deps
npm install @vitejs/plugin-react --save-dev
npm run build
cd ..
