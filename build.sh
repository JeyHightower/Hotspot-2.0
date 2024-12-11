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

# Create package.json if it doesn't exist
echo '{
  "type": "module",
  "dependencies": {},
  "devDependencies": {}
}' > package.json

# Install dependencies in correct order
npm install
npm install --save-dev vite@latest
npm install --save-dev @vitejs/plugin-react@latest
npm install react react-dom
npm install @types/redux-logger

# Create Vite config with proper ESM syntax
cat > vite.config.js << 'EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()]
})
EOF

# Build with explicit dependency path
NODE_ENV=production npx vite build
cd ..
