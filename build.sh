#!/bin/bash

set -euo pipefail
set -x

cd backend

# Fresh start
rm -rf node_modules package-lock.json
rm -rf prisma/client

# Global Prisma installation
npm install -g prisma
npm install -g @prisma/client

# Local installation
npm install
npm install prisma --save-dev
npm install @prisma/client

# Generate fresh client
prisma generate

# Build process
npx tsc
prisma db push --accept-data-loss
cd ..

# Frontend setup
cd frontend
npm install
npm install @vitejs/plugin-react --save-dev
npm run build
cd ..
