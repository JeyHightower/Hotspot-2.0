#!/bin/bash

set -euo pipefail
set -x

cd backend

# Clean start
rm -rf node_modules package-lock.json
rm -rf prisma/client

# Install dependencies in specific order
npm install
npm install typescript @types/express @types/node --save-dev
npm install prisma
npm install @prisma/client

# Set explicit paths
export PRISMA_SCHEMA_PATH="$PWD/prisma/schema.prisma"
export NODE_PATH="$PWD/node_modules"

# Generate client with explicit schema path
npx prisma generate --schema="$PRISMA_SCHEMA_PATH"

# Continue with build
npx tsc
npx prisma db push --accept-data-loss
cd ..

# Frontend build
cd frontend
npm install
npm install @vitejs/plugin-react --save-dev
npm run build
cd ..
