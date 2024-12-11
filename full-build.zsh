#!/bin/zsh

set -euo pipefail
set -x

# Install TypeScript and set up tsc script
npm install typescript --save-dev
npm pkg set scripts.tsc="tsc"

# Install Prisma dependencies
npm install @prisma/client prisma --save-dev

# Navigate to backend and run commands
cd backend || { echo "Failed to change directory to backend"; exit 1; }
npm install
npx prisma generate
npm run tsc
npx prisma db push --accept-data-loss
cd ..

# Navigate to frontend and run commands
cd frontend || { echo "Failed to change directory to frontend"; exit 1; }
npm install
npm run build
cd ..