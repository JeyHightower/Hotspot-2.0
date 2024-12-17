#!/bin/bash

set -euo pipefail

echo "Starting deployment script..."

# Root package.json
echo '{"name": "hotspot-root", "license": "MIT"}' > package.json

# Backend setup
cd backend
echo '{
  "name": "hotspot-backend",
  "license": "MIT",
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "prod": "NODE_ENV=production node dist/index.js"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}' > package.json

# Install dependencies with exact versions
yarn add typescript@5.0.4 \
  @types/node@18.16.0 \
  @types/express@4.17.17 \
  @types/bcryptjs@2.4.2 \
  @types/jsonwebtoken@9.0.2 \
  express@4.18.2 \
  bcryptjs@2.4.3 \
  jsonwebtoken@9.0.0 \
  prisma@4.13.0 \
  express-validator@7.0.1 \
  @prisma/client@4.13.0

# Clean install
yarn install --frozen-lockfile

# TypeScript config
echo '{
  "compilerOptions": {
    "target": "es2020",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}' > tsconfig.json

# Database setup
yarn prisma generate
yarn prisma db push --accept-data-loss

# Build backend
yarn build

# Frontend setup
cd ../frontend
echo '{
  "name": "hotspot-frontend",
  "license": "MIT",
  "scripts": {
    "build": "vite build",
    "start": "serve -s dist"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}' > package.json

# Install frontend dependencies with exact versions
yarn add vite@4.3.1 \
  @vitejs/plugin-react@4.0.0 \
  react@18.2.0 \
  react-dom@18.2.0 \
  react-redux@8.0.5 \
  @reduxjs/toolkit@1.9.5 \
  serve@14.2.1

# Clean install and build frontend
yarn install --frozen-lockfile
yarn build

# Return to root directory
cd ..