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

# Install dependencies
yarn install

# Add build script to package.json
node -e "const p=require('./package.json'); p.scripts=p.scripts||{}; p.scripts.build='vite build'; require('fs').writeFileSync('package.json',JSON.stringify(p,null,2))"

# Install Vite and React dependencies
yarn add vite@latest @vitejs/plugin-react@latest --dev
yarn add react react-dom
yarn add @types/redux-logger

# Create Vite config
cat > vite.config.mjs << 'EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()]
})
EOF

# Build using npm script
yarn run build
cd ..
