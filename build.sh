#!/bin/bash

# Set Node version to meet Prisma requirements
export NODE_VERSION=18.18.0
export NODE_ENV=production

corepack prepare npm@latest --activate

echo "Starting production build..."
npm install

cd backend
rm -rf node_modules
rm package-lock.json
npm cache clean --force
npm install
npx prisma generate
npx build

# Frontend build
cd ../frontend
npm install
cd ..