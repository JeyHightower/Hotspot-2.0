#!/bin/bash

set -euo pipefail
set -x

cd backend

# Fresh start
rm -rf node_modules package-lock.json dist
rm -rf prisma/client

# Install core dependencies first
npm install

# Install and initialize Prisma separately
npm install prisma --save-dev
npm install @prisma/client

# Force Prisma to generate fresh client
rm -rf node_modules/.prisma
npx prisma generate --schema=./prisma/schema.prisma

# Complete the build
npx tsc
npx prisma db push --accept-data-loss
cd ..

# Frontend setup
cd frontend
npm install
npm install @vitejs/plugin-react --save-dev
npm run build
cd ..
