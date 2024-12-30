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
cd ..

# backend
cd backend

# Clean install dependencies
rm -rf node_modules package-lock.json dist
npm cache clean --force

# Install all dependencies (not just production)
npm install

# Generate Prisma client and build
npx prisma generate

# Ensure dist directory is clean
rm -rf dist

# Build TypeScript
npm run build

# Create frontend directory and copy build files
mkdir -p dist/frontend/dist
cp -r ../frontend/dist/* dist/frontend/dist/

# Verify the build
ls -la dist/bin/www.js || echo "Build failed - www.js not found"

# Verify frontend files
echo "Verifying frontend files..."
ls -la dist/frontend/dist

# Remove dev dependencies after build
npm prune --production

cd ..


