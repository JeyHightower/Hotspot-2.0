#!/bin/bash

set -euo pipefail

# Set Node version explicitly
export NODE_VERSION=18.17.0
export NODE_ENV=production

# Enable corepack and set yarn version
corepack enable
yarn set version 4.5.3

# Clear yarn cache and rebuild
yarn cache clean --all

echo "Starting production build..."

# Backend build
cd backend
yarn install --no-immutable
yarn prisma generate
yarn build

# Frontend build
cd ../frontend
yarn install --no-immutable
yarn build

cd ..






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
