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

# Verify the build
ls -la dist/bin/www.js || echo "Build failed - www.js not found"

# Remove dev dependencies after build
npm prune --production

cd ..

# Ensure frontend build is in the correct location
rm -rf backend/dist/frontend
mkdir -p backend/dist/frontend
cp -r frontend/dist/* backend/dist/frontend/

# Verify the static files are in place
echo "Verifying frontend files..."
ls -la backend/dist/frontend


