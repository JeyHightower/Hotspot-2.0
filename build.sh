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

# Frontend setup with explicit Vite installation
cd frontend
rm -rf node_modules package-lock.json yarn.lock

# Install core dependencies first
yarn install

# Install Vite and its plugins globally and locally
npm install -g vite
yarn add vite --dev
yarn add @vitejs/plugin-react --dev
yarn add react react-dom
yarn add @types/redux-logger

# Create Vite config as ESM
cat > vite.config.mjs << 'EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()]
})
EOF

# Build with explicit path
./node_modules/.bin/vite build
cd ..
