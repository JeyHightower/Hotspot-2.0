#!/bin/bash

set -euo pipefail
set -x

cd backend

# Backend setup
rm -rf node_modules package-lock.json yarn.lock
rm -rf prisma/client

npm install -g yarn

yarn install
yarn add typescript@5.7.2 @types/express@5.0.0 @types/node@22.10.1 --dev
yarn add prisma@5.7.0 --dev
yarn add @prisma/client@5.7.0
yarn add --dev ts-node@10.9.2
yarn add --dev @types/express-serve-static-core

NODE_ENV=development npx prisma generate
yarn exec tsc
npx prisma db push --accept-data-loss
cd ..

# Frontend setup with complete Vite tooling
cd frontend
rm -rf node_modules package-lock.json yarn.lock
yarn install
yarn add vite @vitejs/plugin-react --dev
yarn add @types/redux-logger
npx vite build
cd ..
