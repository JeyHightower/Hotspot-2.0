#!/bin/bash

set -euo pipefail
set -x

cd backend

# Clean start
rm -rf node_modules package-lock.json
rm -rf prisma/client

# Create a fresh package.json if needed
npm init -y

# Install dependencies with exact versions
npm install typescript@5.0.4 @types/express@4.17.17 @types/node@20.2.5 --save-dev
npm install prisma@5.0.0
npm install @prisma/client@5.0.0

# Generate Prisma artifacts
npx prisma generate --schema=./prisma/schema.prisma

# Build and deploy
npx tsc
npx prisma db push --accept-data-loss
cd ..

# Frontend
cd frontend
npm install
npm install @vitejs/plugin-react --save-dev
npm run build
cd ..
