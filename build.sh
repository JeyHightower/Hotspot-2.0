#!/bin/bash

set -euo pipefail
set -x

cd backend

# Clean start with npm cache reset
rm -rf node_modules package-lock.json
npm cache clean --force

# Install dependencies in specific order
npm install --production=false
npm install typescript @types/express @types/node --save-dev
npm install prisma --save-dev
npm install @prisma/client

# Create fresh Prisma client
mkdir -p prisma/client
npx prisma generate --schema=./prisma/schema.prisma

# Build and deploy
npx tsc
npx prisma db push --accept-data-loss
cd ..

# Frontend setup
cd frontend
npm install
npm install @vitejs/plugin-react --save-dev
npm run build
cd ..
