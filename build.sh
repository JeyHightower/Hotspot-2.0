#!/bin/bash

set -euo pipefail

# Set environment
export NODE_VERSION=20.10.0
export NODE_ENV=production
export PATH="/opt/render/project/node_modules/.bin:$PATH"

# Setup Yarn
corepack enable
yarn set version 4.5.3

echo "Starting production build..."

# Backend build
cd backend
rm -rf node_modules
yarn install
yarn prisma generate
yarn build

# Frontend build
cd ../frontend
rm -rf node_modules
yarn install
yarn build

cd ..
