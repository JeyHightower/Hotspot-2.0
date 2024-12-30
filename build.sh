#!/bin/bash

# Set environment
export NODE_VERSION=18.18.0
export NODE_ENV=production

# Activate npm
corepack prepare npm@latest --activate

# frontend first
cd frontend
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
npm run build

# Verify frontend build
echo "Verifying frontend build..."
ls -la dist

cd ..

# backend
cd backend

# Clean install dependencies
rm -rf node_modules package-lock.json dist
npm cache clean --force
npm install

# Generate Prisma client and build
npx prisma generate

# Build TypeScript
npm run build

# Create frontend directory and copy build files
mkdir -p dist/frontend/dist
cp -r ../frontend/dist/* dist/frontend/dist/
chmod -R 755 dist/frontend/dist

# Verify the builds
echo "Verifying backend build..."
ls -la dist/bin/www.js || echo "Build failed - www.js not found"

echo "Verifying frontend files in backend..."
ls -la dist/frontend/dist

# Remove dev dependencies after build
npm prune --production

cd ..


