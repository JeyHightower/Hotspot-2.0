#!/bin/bash

set -euo pipefail

# Set Node version to meet Prisma requirements
export NODE_VERSION=18.18.0
export NODE_ENV=production

corepack enable
yarn set version 4.5.3

echo "Starting production build..."

# Backend build
cd backend
yarn install
yarn prisma generate
yarn build

# Frontend build
cd ../frontend
yarn install
yarn build

cd ..
