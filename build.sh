#!/bin/bash

# Set environment
export NODE_VERSION=18.18.0
export NODE_ENV=production

# Activate npm
corepack prepare npm@latest --activate

# backend
cd backend

# Clean install dependencies
rm -rf node_modules package-lock.json dist
npm cache clean --force

# Install all dependencies (not just production)
npm install

# Generate Prisma client and build
npx prisma generate
npm run build

# Remove dev dependencies after build
npm prune --production

# frontend
cd ../frontend
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
npm run build
cd ..


