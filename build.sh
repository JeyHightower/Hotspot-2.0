#!/bin/bash

set -euo pipefail

# Set Node version explicitly
export NODE_VERSION=18.17.0
export NODE_ENV=production

corepack enable
yarn set version 4.5.3

echo "Starting production build..."

# Backend build with optimizations
cd backend
CI=true yarn install --frozen-lockfile --production=false
yarn prisma generate
yarn build

# Frontend build with optimizations
cd ../frontend
CI=true yarn install --frozen-lockfile --production=false
VITE_DISABLE_WATCHERS=true yarn build --mode production

cd ..


#





# set -euo pipefail

# corepack enable
# yarn set version 4.5.3

# echo "Starting deployment script..."

# cd backend

# # Install dependencies
# yarn install --frozen-lockfile

# # Generate Prisma client
# yarn prisma generate

# # Build backend
# yarn build

# cd ../frontend

# # Install and build frontend
# yarn install
# yarn build

# cd ..
