#!/bin/zsh

set -euo pipefail
set -x

# Backend setup
cd backend || { echo "Failed to change directory to backend"; exit 1; }
npm install
npm install typescript --save-dev
npm install @prisma/client prisma --save-dev
npx tsc
npx prisma generate
npx prisma db push --accept-data-loss
cd ..

# Frontend setup
cd frontend || { echo "Failed to change directory to frontend"; exit 1; }
npm install
npm install @vitejs/plugin-react --save-dev
npm run build
cd ..
cd ..