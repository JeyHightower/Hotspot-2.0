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

# Frontend setup
cd frontend
rm -rf node_modules package-lock.json yarn.lock

# Create package.json with correct build script
echo '{
  "name": "frontend",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "build": "./node_modules/.bin/vite build"
  }
}' > package.json

# Install dependencies with exact versions
npm install vite@4.5.0 @vitejs/plugin-react@4.0.0 react@18.2.0 react-dom@18.2.0 @types/redux-logger --save-dev

# Create Vite config
cat > vite.config.js << 'EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()]
})
EOF

# Build with exact path
npm run build
cd ..
