#!/bin/zsh

set -euo pipefail
set -x

# Navigate to backend and run commands
cd backend || { echo "Failed to change directory to backend"; exit 1; }
npm install
npm install typescript --save-dev
npm install @prisma/client prisma --save-dev
npx tsc
npx prisma generate
npx prisma db push --accept-data-loss
cd ..

# Navigate to frontend and run commands
cd frontend || { echo "Failed to change directory to frontend"; exit 1; }
npm install
npm run build
cd ..